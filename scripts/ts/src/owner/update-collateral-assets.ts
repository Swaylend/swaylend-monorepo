/**
 * update-collateral-assets.ts — TS port of scripts/src/update_collateral_assets.rs
 *
 * For each entry in config.collateral_assets:
 *   - If the asset_id is already configured on-chain, call update_collateral_asset.
 *   - Otherwise call add_collateral_asset.
 *
 * Each pending change is prompted before submission.
 *
 * Usage:
 *   pnpm update-collateral-assets <path/to/config.json>
 */

import { createBakoVault, waitForBakoTxWithFallback } from '../lib/bako';
import { config } from '../lib/config';
import { getMarket } from '../lib/contracts';
import { readMarketConfig } from '../lib/marketConfig';
import {
  deepEqualBN,
  toCollateralConfigurationInput,
} from '../lib/marketConfigMapping';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';

export async function updateCollateralAssets(configPath: string) {
  const cfg = readMarketConfig(configPath);

  const { vault, provider } = await createBakoVault();
  await verifyNetwork(provider, config.network);

  console.log(`Signer (Bako vault): ${vault.address.toB256()}`);
  console.log(`Market (via proxy):  ${config.proxyContractId}`);
  console.log(`Config file:         ${configPath}`);

  const market = getMarket(vault);

  const version = (await market.functions.get_version().get()).value;
  console.log(`Market version: ${version}`);

  const current = (await market.functions.get_collateral_configurations().get()).value;
  // current is a Vec<CollateralConfigurationOutput>; map by asset_id
  const currentByAssetId = new Map<string, (typeof current)[number]>();
  for (const item of current) {
    currentByAssetId.set(item.asset_id.bits, item);
  }
  console.log(`On-chain collateral assets: ${current.length}`);

  for (const asset of cfg.collateral_assets) {
    const desired = toCollateralConfigurationInput(asset);
    const existing = currentByAssetId.get(asset.asset_id);
    const label = `${asset.symbol} (${asset.asset_id})`;

    if (!existing) {
      console.log(`\n+ New collateral: ${label}`);
      console.log('  Desired:', JSON.stringify(desired, null, 2));
      if (!(await confirm(`add_collateral_asset(${asset.symbol})?`))) {
        console.log('  skipped.');
        continue;
      }
      const interval = setInterval(() => console.log('  ⏳ Waiting for Bako sigs...'), 5000);
      try {
        const tx = await market.functions.add_collateral_asset(desired).call();
        const r = await waitForBakoTxWithFallback(tx, `add_collateral_asset(${asset.symbol})`);
        clearInterval(interval);
        if (r) console.log('  ✅ added:', r.transactionId);
      } finally {
        clearInterval(interval);
      }
      continue;
    }

    if (deepEqualBN(existing, desired)) {
      console.log(`✓ ${label} unchanged.`);
      continue;
    }

    console.log(`\n~ Collateral changed: ${label}`);
    console.log('  Current:', JSON.stringify(existing, null, 2));
    console.log('  Desired:', JSON.stringify(desired, null, 2));
    if (!(await confirm(`update_collateral_asset(${asset.symbol})?`))) {
      console.log('  skipped.');
      continue;
    }
    const interval = setInterval(() => console.log('  ⏳ Waiting for Bako sigs...'), 5000);
    try {
      const tx = await market.functions
        .update_collateral_asset({ bits: asset.asset_id }, desired)
        .call();
      const r = await waitForBakoTxWithFallback(tx, `update_collateral_asset(${asset.symbol})`);
      clearInterval(interval);
      if (r) console.log('  ✅ updated:', r.transactionId);
    } finally {
      clearInterval(interval);
    }
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: pnpm update-collateral-assets <path/to/config.json>');
  process.exit(1);
}

updateCollateralAssets(arg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
