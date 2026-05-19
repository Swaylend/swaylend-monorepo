/**
 * change-proxy-owner.ts — TS port of scripts/src/change_proxy_owner.rs
 *
 * Transfers ownership of the proxy contract to a new identity. The proxy owner
 * is the only address allowed to swap the underlying implementation contract,
 * so this is the most security-critical owner action in the protocol.
 *
 * Usage:
 *   pnpm change-proxy-owner address:0x...
 *   pnpm change-proxy-owner contract:0x...
 *
 * Requires env (see .env.example):
 *   PROVIDER_URL, PROXY_CONTRACT_ID, NETWORK
 *   BAKO_WALLET_ADDRESS, BAKO_TOKEN_API   (current proxy owner must be the Bako vault)
 */

import { createBakoVault, waitForBakoTxWithFallback } from '../lib/bako';
import { config } from '../lib/config';
import { getProxy } from '../lib/contracts';
import { formatIdentity, parseIdentity } from '../lib/identity';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';
import type { StateInput } from '../sway-api/Proxy';

export async function changeProxyOwner(newOwnerSpec: string) {
  const newIdentity = parseIdentity(newOwnerSpec);
  const newOwnerState: StateInput = { Initialized: newIdentity };

  const { vault, provider } = await createBakoVault();
  await verifyNetwork(provider, config.network);

  console.log(`Signer (Bako vault):  ${vault.address.toB256()}`);
  console.log(`Proxy contract:       ${config.proxyContractId}`);

  const proxy = getProxy(vault);

  // Read current owner (dry-run, no signature needed)
  const current = (await proxy.functions.proxy_owner().get()).value;
  console.log('Current proxy owner:', JSON.stringify(current, null, 2));
  console.log('Requested new owner:', formatIdentity(newIdentity));

  if (!(await confirm('Proceed with ownership transfer? (THIS IS IRREVERSIBLE if the new owner cannot sign)'))) {
    console.log('Aborted.');
    return;
  }

  console.log('\nSubmitting set_proxy_owner...');
  console.log('Required signers must approve at https://safe.bako.global');

  let progressInterval: NodeJS.Timeout | undefined;
  try {
    progressInterval = setInterval(() => {
      console.log('⏳ Waiting for Bako signatures + tx confirmation...');
    }, 5000);

    const tx = await proxy.functions.set_proxy_owner(newOwnerState).call();
    const result = await waitForBakoTxWithFallback(tx, 'set_proxy_owner');
    clearInterval(progressInterval);
    if (result) console.log('✅ Tx mined:', result.transactionId);
  } finally {
    if (progressInterval) clearInterval(progressInterval);
  }

  // Verify
  const after = (await proxy.functions.proxy_owner().get()).value;
  console.log('New proxy owner (verified):', JSON.stringify(after, null, 2));
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: pnpm change-proxy-owner <address:0x...|contract:0x...>');
  process.exit(1);
}

changeProxyOwner(arg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
