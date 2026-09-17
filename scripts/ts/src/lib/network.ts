import type { Provider } from 'fuels';
import type { Network } from './config';

// Fuel mainnet reports its chain name as "Ignition", not "mainnet", so matching
// on the literal word rejects the real mainnet and every owner script fails its
// network check before doing anything.
const EXPECTED_CHAIN_NAME: Record<Network, string[]> = {
  mainnet: ['mainnet', 'ignition'],
  testnet: ['testnet'],
  devnet: ['devnet', 'local'],
};

export async function verifyNetwork(provider: Provider, expected: Network): Promise<void> {
  const chain = await provider.fetchChain();
  const name = chain.name.toLowerCase();
  const allowed = EXPECTED_CHAIN_NAME[expected];
  if (!allowed.some((a) => name.includes(a))) {
    throw new Error(
      `Network mismatch: expected ${expected} (one of ${allowed.join(', ')}), got chain name "${chain.name}".\n` +
        `Check PROVIDER_URL and NETWORK env vars.`,
    );
  }
  console.log(`✓ Connected to ${chain.name} (${expected})`);
}
