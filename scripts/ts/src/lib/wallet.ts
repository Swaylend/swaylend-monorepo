import { Provider, Wallet, type WalletUnlocked } from 'fuels';
import { config, required, requireField } from './config';

/**
 * Creates a regular Fuel wallet from SIGNING_KEY env var.
 *
 * Use this for:
 *  - Permissionless scripts (deploy, mint, fill_reserves).
 *  - Read-only inspection paths in owner scripts.
 *  - The inner signer when interacting with a Bako test vault you control directly.
 *
 * For owner-only contract calls against a Bako multisig, use `createBakoVault()` instead.
 */
export async function createWallet(): Promise<{ wallet: WalletUnlocked; provider: Provider }> {
  const providerUrl = requireField('providerUrl');
  const signingKey = requireField('signingKey');
  const provider = new Provider(providerUrl);
  const wallet = Wallet.fromPrivateKey(signingKey, provider);
  return { wallet, provider };
}

/**
 * Anonymous read-only provider + a throwaway wallet, useful for `dryRun()` calls.
 */
export async function createReadOnlyWallet(): Promise<{ wallet: WalletUnlocked; provider: Provider }> {
  const provider = new Provider(required('PROVIDER_URL'));
  const wallet = Wallet.generate({ provider });
  return { wallet, provider };
}
