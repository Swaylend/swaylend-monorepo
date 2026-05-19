import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export type Network = 'mainnet' | 'testnet' | 'devnet';

function asNetwork(v: string): Network {
  if (v === 'mainnet' || v === 'testnet' || v === 'devnet') return v;
  throw new Error(`Invalid NETWORK="${v}". Must be mainnet | testnet | devnet.`);
}

export const config = {
  network: asNetwork(process.env.NETWORK ?? 'testnet'),
  providerUrl: optional('PROVIDER_URL'),
  proxyContractId: optional('PROXY_CONTRACT_ID'),
  targetContractId: optional('TARGET_CONTRACT_ID'),
  pythContractId: optional('PYTH_CONTRACT_ID'),
  tokenContractId: optional('TOKEN_CONTRACT_ID'),
  signingKey: optional('SIGNING_KEY'),
  bako: {
    walletAddress: optional('BAKO_WALLET_ADDRESS'),
    apiToken: optional('BAKO_TOKEN_API'),
    apiUrl: optional('BAKO_API_URL'),
  },
} as const;

// `required` is intentionally kept exported for ad-hoc use.
export { required };

export function requireField<K extends keyof typeof config>(key: K): NonNullable<(typeof config)[K]> {
  const v = config[key];
  if (v === undefined || v === null) {
    throw new Error(`Missing required config field: ${String(key)}. Set the corresponding env var.`);
  }
  return v as NonNullable<(typeof config)[K]>;
}
