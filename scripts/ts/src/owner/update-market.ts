/**
 * update-market.ts — TS port of scripts/src/update_market.rs
 *
 * Reads a market config JSON, compares each of three slices against on-chain state,
 * and conditionally calls one of:
 *   - update_market_configuration(MarketConfiguration)
 *   - set_pyth_contract_id(ContractId)
 *   - pause(PauseConfiguration)
 *
 * Usage:
 *   pnpm update-market <path/to/config.json>
 *
 * The Rust version prompts y/n per section. We do the same.
 */

import { createBakoVault, waitForBakoTxWithFallback } from '../lib/bako';
import { config } from '../lib/config';
import { getMarket } from '../lib/contracts';
import { readMarketConfig } from '../lib/marketConfig';
import {
  deepEqualBN,
  toMarketConfigurationInput,
  toPauseConfigurationInput,
} from '../lib/marketConfigMapping';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';

export async function updateMarket(configPath: string) {
  const cfg = readMarketConfig(configPath);

  const { vault, provider } = await createBakoVault();
  await verifyNetwork(provider, config.network);

  console.log(`Signer (Bako vault): ${vault.address.toB256()}`);
  console.log(`Market (via proxy):  ${config.proxyContractId}`);
  console.log(`Config file:         ${configPath}`);

  const market = getMarket(vault);
  const version = (await market.functions.get_version().get()).value;
  console.log(`Market version: ${version}`);

  // -------- Section 1: market configuration --------
  const currentMarketCfg = (await market.functions.get_market_configuration().get()).value;
  const desiredMarketCfg = toMarketConfigurationInput(cfg);

  if (deepEqualBN(currentMarketCfg, desiredMarketCfg)) {
    console.log('✓ Market configuration unchanged.');
  } else {
    console.log('Market configuration differs:');
    console.log('  Current:', JSON.stringify(currentMarketCfg, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
    console.log('  Desired:', JSON.stringify(desiredMarketCfg, null, 2));
    if (await confirm('Apply update_market_configuration?')) {
      const interval = setInterval(() => console.log('⏳ Waiting for Bako sigs...'), 5000);
      try {
        const tx = await market.functions.update_market_configuration(desiredMarketCfg).call();
        const r = await waitForBakoTxWithFallback(tx, 'update_market_configuration');
        clearInterval(interval);
        if (r) console.log('✅ market config updated:', r.transactionId);
      } finally {
        clearInterval(interval);
      }
    }
  }

  // -------- Section 2: Pyth contract id --------
  const currentPyth = (await market.functions.get_pyth_contract_id().get()).value;
  const desiredPyth = cfg.pyth_contract_id;

  if (currentPyth?.bits === desiredPyth) {
    console.log('✓ Pyth contract id unchanged.');
  } else {
    console.log(`Pyth contract differs: current=${currentPyth?.bits}  desired=${desiredPyth}`);
    if (await confirm('Apply set_pyth_contract_id?')) {
      const interval = setInterval(() => console.log('⏳ Waiting for Bako sigs...'), 5000);
      try {
        const tx = await market.functions.set_pyth_contract_id({ bits: desiredPyth }).call();
        const r = await waitForBakoTxWithFallback(tx, 'set_pyth_contract_id');
        clearInterval(interval);
        if (r) console.log('✅ pyth id updated:', r.transactionId);
      } finally {
        clearInterval(interval);
      }
    }
  }

  // -------- Section 3: pause configuration --------
  const currentPause = (await market.functions.get_pause_configuration().get()).value;
  const desiredPause = toPauseConfigurationInput(cfg);

  if (deepEqualBN(currentPause, desiredPause)) {
    console.log('✓ Pause configuration unchanged.');
  } else {
    console.log('Pause configuration differs:');
    console.log('  Current:', currentPause);
    console.log('  Desired:', desiredPause);
    if (await confirm('Apply pause(...)?')) {
      const interval = setInterval(() => console.log('⏳ Waiting for Bako sigs...'), 5000);
      try {
        const tx = await market.functions.pause(desiredPause).call();
        const r = await waitForBakoTxWithFallback(tx, 'pause');
        clearInterval(interval);
        if (r) console.log('✅ pause config updated:', r.transactionId);
      } finally {
        clearInterval(interval);
      }
    }
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: pnpm update-market <path/to/config.json>');
  process.exit(1);
}

updateMarket(arg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
