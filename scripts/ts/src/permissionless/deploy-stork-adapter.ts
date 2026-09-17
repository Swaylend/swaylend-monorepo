/**
 * deploy-stork-adapter.ts — deploy and wire up the Stork -> Pyth adapter.
 *
 * Deploys contracts/stork-pyth-adapter, initialises it with the deployer as
 * owner, writes one feed mapping per asset, then hands ownership to the Bako
 * vault. Ownership moves last on purpose: every `set_feed` before the handover
 * is a plain wallet call, so the whole table lands in one run instead of
 * needing N rounds of multisig signatures.
 *
 * Deploying does not affect the market. The switch is a separate, reversible
 * step — set `pyth_contract_id` to the address printed here in the market
 * config, then run `pnpm update-market`.
 *
 * Usage:
 *   pnpm deploy-stork-adapter configs/stork-feeds.mainnet.json
 */

import { readFileSync } from 'node:fs';
import { config } from '../lib/config';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';
import { createWallet } from '../lib/wallet';
import { StorkPythAdapterFactory } from '../sway-api/StorkPythAdapterFactory';
import { StorkPythAdapter } from '../sway-api/StorkPythAdapter';

type FeedEntry = {
  symbol: string;
  storkAsset: string;
  priceFeedId: string;
  storkAssetId: string;
  exponent: number;
  confBps: number;
};

type FeedsConfig = {
  network: string;
  storkContractId: string;
  feeds: FeedEntry[];
  unsupported?: { symbol: string; reason: string }[];
};

/** Mirrors MAX_CONF_BPS in the adapter and ORACLE_MAX_CONF_WIDTH in the market. */
const MAX_CONF_BPS = 300;

function readFeedsConfig(path: string): FeedsConfig {
  const cfg = JSON.parse(readFileSync(path, 'utf8')) as FeedsConfig;

  if (cfg.network !== config.network) {
    throw new Error(`Config is for ${cfg.network} but NETWORK=${config.network}.`);
  }
  for (const f of cfg.feeds) {
    if (f.exponent > 18) throw new Error(`${f.symbol}: exponent ${f.exponent} exceeds Stork's 18 decimals.`);
    if (f.confBps > MAX_CONF_BPS) throw new Error(`${f.symbol}: confBps ${f.confBps} exceeds the ${MAX_CONF_BPS} bps cap.`);
  }
  return cfg;
}

export async function deployStorkAdapter(configPath: string) {
  const cfg = readFeedsConfig(configPath);
  const { wallet, provider } = await createWallet();
  await verifyNetwork(provider, config.network);

  console.log(`Deployer:       ${wallet.address.toB256()}`);
  console.log(`Stork contract: ${cfg.storkContractId}`);
  console.log(`Feeds:          ${cfg.feeds.map((f) => f.symbol).join(', ')}`);

  if (cfg.unsupported?.length) {
    console.warn('\n⚠️  Assets with no Stork feed — the market cannot price these after the switch:');
    for (const u of cfg.unsupported) console.warn(`     ${u.symbol}: ${u.reason}`);
  }

  const bakoVault = config.bako.walletAddress;
  if (bakoVault) {
    console.log(`\nOwnership will transfer to Bako vault: ${bakoVault}`);
  } else {
    console.warn('\n⚠️  BAKO_WALLET_ADDRESS not set — ownership will stay with the deployer.');
  }

  if (!(await confirm('\nDeploy the Stork adapter?'))) {
    console.log('Aborted.');
    return;
  }

  const { waitForResult } = await StorkPythAdapterFactory.deploy(wallet);
  const { contract } = await waitForResult();
  const contractId = contract.id.toB256();
  console.log(`✅ Adapter deployed at: ${contractId}`);

  const adapter = new StorkPythAdapter(contractId, wallet);

  console.log('\n→ initialize(owner = deployer, stork_contract_id)');
  await (
    await adapter.functions
      .initialize({ Address: { bits: wallet.address.toB256() } }, { bits: cfg.storkContractId })
      .call()
  ).waitForResult();
  console.log('   done.');

  for (const f of cfg.feeds) {
    console.log(`→ set_feed ${f.symbol.padEnd(7)} expo=${f.exponent} confBps=${f.confBps} -> ${f.storkAsset}`);
    await (
      await adapter.functions
        .set_feed(f.priceFeedId, {
          stork_id: f.storkAssetId,
          exponent: f.exponent,
          conf_bps: f.confBps,
        })
        .call()
    ).waitForResult();
  }

  console.log('\n→ Verifying feeds read back correctly...');
  for (const f of cfg.feeds) {
    const { value } = await adapter.functions.get_feed(f.priceFeedId).get();
    const ok = value?.stork_id === f.storkAssetId && Number(value?.exponent) === f.exponent;
    console.log(`   ${ok ? '✓' : '✗'} ${f.symbol}`);
    if (!ok) throw new Error(`Feed ${f.symbol} did not read back as written.`);
  }

  if (bakoVault) {
    console.log(`\n→ transfer_ownership -> ${bakoVault}`);
    await (
      await adapter.functions.transfer_ownership({ Address: { bits: bakoVault } }).call()
    ).waitForResult();
    const { value: owner } = await adapter.functions.owner().get();
    console.log(`   owner is now: ${JSON.stringify(owner)}`);
  }

  console.log('\nNext: point the market at it (reversible).');
  console.log(`  1. Set "pyth_contract_id": "${contractId}" in the market config JSON`);
  console.log('  2. pnpm update-market <path/to/market-config.json>');
}

const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: pnpm deploy-stork-adapter <path/to/stork-feeds.json>');
  process.exit(1);
}

deployStorkAdapter(configPath).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
