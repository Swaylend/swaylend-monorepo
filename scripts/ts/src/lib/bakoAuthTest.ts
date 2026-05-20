/**
 * Smoke test — verify Bako API token + vault address actually work end-to-end.
 * No writes, no signatures. Just: connect, load vault, read its address back.
 */

import { createBakoVault } from './bako';

async function main() {
  console.log('→ Connecting to Bako with apiToken...');
  const { vault, provider } = await createBakoVault();

  console.log('✓ Authenticated.');
  console.log(`  Vault address (b256):  ${vault.address.toB256()}`);
  console.log(`  Provider chain:        ${(await provider.fetchChain()).name}`);

  // Read the vault's ETH balance on testnet — proves the Vault is usable as an account.
  const ethBalance = await provider.getBalance(
    vault.address,
    '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
  );
  console.log(`  Vault testnet ETH balance: ${ethBalance.toString()}`);

  console.log('\n✅ Bako auth + Vault.fromAddress + read-as-account all work.');
}

main().catch((err) => {
  console.error('❌ Bako auth test failed:');
  console.error(err);
  process.exit(1);
});
