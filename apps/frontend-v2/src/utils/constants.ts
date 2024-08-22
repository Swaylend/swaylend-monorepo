export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL!;
export interface IContractsConfig {
  priceOracle: string;
  market: string;
  tokenFactory: string;
}

export const CONTRACT_ADDRESSES: IContractsConfig = {
  priceOracle:
    '0x73591bf32f010ce4e83d86005c24e7833b397be38014ab670a73f6fde59ad607',
  market: '0xea9d4a55ca16271f42992529bb68de095249ceb8d95176576098bb9b98cd3975',
  tokenFactory:
    '0x36d896016b570d6638029968e6cdf84b9249ad7e5b295848f7140b56b3303532',
};

export const FAUCET_URL = 'https://faucet-testnet.fuel.network/';
export const FAUCET_TOKENS = {
  Ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 9,
    assetId:
      '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
  },
  USDC: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    assetId:
      '0xb5a7ec61506d83f6e4739be2dc57018898b1e08684c097c73b582c9583e191e2',
  },
  Bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    assetId:
      '0x00dc5cda67b6a53b60fa53f95570fdaabb5b916c0e6d614a3f5d9de68f832e61',
  },
  Uniswap: {
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 9,
    assetId:
      '0xf7c5f807c40573b5db88e467eb9aabc42332483493f7697442e1edbd59e020ad',
  },
};
export const FAUCET_AMOUNTS: Record<string, number> = {
  UNI: 50,
  BTC: 1,
  USDC: 300,
};
