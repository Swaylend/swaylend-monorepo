/**
 * change-market-owner.ts — TS port of scripts/src/change_market_owner.rs
 *
 * Transfers ownership of the market contract via market.transfer_ownership().
 * The market owner can update config, withdraw reserves, etc. This is owner-gated
 * by the market itself (different from the proxy owner).
 *
 * Usage:
 *   pnpm change-market-owner address:0x...
 *   pnpm change-market-owner contract:0x...
 */

import { createBakoVault, waitForBakoTxWithFallback } from '../lib/bako';
import { config } from '../lib/config';
import { getMarket } from '../lib/contracts';
import { formatIdentity, parseIdentity } from '../lib/identity';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';

export async function changeMarketOwner(newOwnerSpec: string) {
  const newIdentity = parseIdentity(newOwnerSpec);

  const { vault, provider } = await createBakoVault();
  await verifyNetwork(provider, config.network);

  console.log(`Signer (Bako vault):  ${vault.address.toB256()}`);
  console.log(`Market (via proxy):   ${config.proxyContractId}`);

  const market = getMarket(vault);

  const version = (await market.functions.get_version().get()).value;
  console.log(`Market version:       ${version}`);

  const current = (await market.functions.owner().get()).value;
  console.log('Current market owner:', JSON.stringify(current, null, 2));
  console.log('Requested new owner: ', formatIdentity(newIdentity));

  if (!(await confirm('Proceed with market ownership transfer?'))) {
    console.log('Aborted.');
    return;
  }

  console.log('\nSubmitting transfer_ownership...');
  console.log('Required signers must approve at https://safe.bako.global');

  const interval = setInterval(() => {
    console.log('⏳ Waiting for Bako signatures + tx confirmation...');
  }, 5000);

  try {
    const tx = await market.functions.transfer_ownership(newIdentity).call();
    const result = await waitForBakoTxWithFallback(tx, 'transfer_ownership');
    clearInterval(interval);
    if (result) console.log('✅ Tx mined:', result.transactionId);
  } finally {
    clearInterval(interval);
  }

  const after = (await market.functions.owner().get()).value;
  console.log('New market owner (verified):', JSON.stringify(after, null, 2));
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: pnpm change-market-owner <address:0x...|contract:0x...>');
  process.exit(1);
}

changeMarketOwner(arg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
