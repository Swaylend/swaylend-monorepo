import { BakoProvider, Vault } from 'bakosafe';
import { Address } from 'fuels';
import { requireField } from './config';

/**
 * Connects to an existing Bako Safe vault as a multisig signer for contract calls.
 *
 * Returns a `Vault` instance that is API-compatible with `WalletUnlocked` —
 * you can pass it directly to a contract: `new MarketContract(id, vault)`.
 *
 * Calling `.functions.x(...).call()` on such a contract queues a tx for
 * multi-party signing at https://safe.bako.global. The script then blocks on
 * `.waitForResult()` until the required signatures land and the tx is mined.
 *
 * Requires env vars:
 *   - PROVIDER_URL          Fuel RPC URL (must match Bako vault's network)
 *   - BAKO_WALLET_ADDRESS   the vault address (b256)
 *   - BAKO_TOKEN_API        api token from https://safe.bako.global
 */
export async function createBakoVault(): Promise<{ vault: Vault; provider: BakoProvider }> {
  const providerUrl = requireField('providerUrl');
  const apiToken = requireField('bako').apiToken;
  const walletAddress = requireField('bako').walletAddress;
  if (!apiToken) throw new Error('Missing required env var: BAKO_TOKEN_API');
  if (!walletAddress) throw new Error('Missing required env var: BAKO_WALLET_ADDRESS');

  const provider = await BakoProvider.create(providerUrl, { apiToken });
  const vault = await Vault.fromAddress(new Address(walletAddress).toB256(), provider);
  return { vault, provider };
}

/**
 * Workaround for bakosafe@0.5.4 — `tx.waitForResult()` keeps polling Bako's
 * backend even after the tx has already mined on-chain. Race it against a
 * timeout; on timeout, return null and let the caller verify success via an
 * on-chain probe.
 */
export async function waitForBakoTxWithFallback<T>(
  tx: { waitForResult: () => Promise<T> },
  label: string,
  timeoutMs = 120_000,
): Promise<T | null> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => {
      console.log(
        `⏱  ${label}: waitForResult() timed out after ${timeoutMs / 1000}s. Continuing — will verify via on-chain probe.`,
      );
      resolve(null);
    }, timeoutMs);
  });
  try {
    return await Promise.race([tx.waitForResult(), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
