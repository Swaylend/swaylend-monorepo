import { defineConfig } from '../defineConfig.js';
import type { DeployedMarkets } from '../types.js';

export function createMainnetConfig() {
  return defineConfig({
    env: 'mainnet',
    markets: markets,
    assets: assets,
  });
}

const markets: DeployedMarkets = {
  USDC: {
    marketAddress:
      '0x6ad4681dfbc01a1019335f9d9cb3fa06e4ae7ed334ff20fb4576d6b471889c84',
    startBlock: BigInt(2000000),
  },
};

const assets: Record<string, string> = {
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b': 'USDC',
};
