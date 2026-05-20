/**
 * activate-market.ts — TS port of scripts/src/activate_market.rs
 *
 * One-shot initialization of a freshly deployed market:
 *   1. market.activate_contract(MarketConfiguration, owner Identity)
 *   2. market.set_pyth_contract_id(pyth_contract_id)
 *
 * Owner argument defaults to the Bako vault address (recommended), or can be
 * overridden via CLI.
 *
 * Usage:
 *   pnpm activate-market <path/to/config.json>
 *   pnpm activate-market <path/to/config.json> address:0x...
 *   pnpm activate-market <path/to/config.json> contract:0x...
 */

import { createBakoVault, waitForBakoTxWithFallback } from '../lib/bako';
import { config } from '../lib/config';
import { getMarket } from '../lib/contracts';
import { formatIdentity, parseIdentity } from '../lib/identity';
import { readMarketConfig } from '../lib/marketConfig';
import { toMarketConfigurationInput } from '../lib/marketConfigMapping';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';

export async function activateMarket(configPath: string, ownerSpec?: string) {
  const cfg = readMarketConfig(configPath);
  const marketCfgInput = toMarketConfigurationInput(cfg);

  const { vault, provider } = await createBakoVault();
  await verifyNetwork(provider, config.network);

  const ownerIdentity = ownerSpec
    ? parseIdentity(ownerSpec)
    : { Address: { bits: vault.address.toB256() } };

  console.log(`Signer (Bako vault): ${vault.address.toB256()}`);
  console.log(`Market (via proxy):  ${config.proxyContractId}`);
  console.log(`Config file:         ${configPath}`);
  console.log(`Owner to set:        ${formatIdentity(ownerIdentity)}`);
  console.log(`Pyth contract id:    ${cfg.pyth_contract_id}`);

  const market = getMarket(vault);

  const version = (await market.functions.get_version().get()).value;
  console.log(`Market version: ${version}`);

  if (!(await confirm('Activate market with the above settings? (This can only be done once)'))) {
    console.log('Aborted.');
    return;
  }

  console.log('\nSubmitting activate_contract...');
  console.log('Required signers must approve at https://safe.bako.global');
  {
    const interval = setInterval(() => console.log('⏳ Waiting for Bako sigs...'), 5000);
    try {
      const tx = await market.functions.activate_contract(marketCfgInput, ownerIdentity).call();
      const r = await waitForBakoTxWithFallback(tx, 'activate_contract');
      clearInterval(interval);
      if (r) console.log('✅ activate_contract mined:', r.transactionId);
    } finally {
      clearInterval(interval);
    }
  }

  console.log('\nSubmitting set_pyth_contract_id...');
  {
    const interval = setInterval(() => console.log('⏳ Waiting for Bako sigs...'), 5000);
    try {
      const tx = await market.functions.set_pyth_contract_id({ bits: cfg.pyth_contract_id }).call();
      const r = await waitForBakoTxWithFallback(tx, 'set_pyth_contract_id');
      clearInterval(interval);
      if (r) console.log('✅ set_pyth_contract_id mined:', r.transactionId);
    } finally {
      clearInterval(interval);
    }
  }

  const finalCfg = (await market.functions.get_market_configuration().get()).value;
  console.log('Final on-chain market configuration:', JSON.stringify(finalCfg, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
}

const [pathArg, ownerArg] = process.argv.slice(2);
if (!pathArg) {
  console.error('Usage: pnpm activate-market <path/to/config.json> [address:0x...|contract:0x...]');
  process.exit(1);
}

activateMarket(pathArg, ownerArg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
