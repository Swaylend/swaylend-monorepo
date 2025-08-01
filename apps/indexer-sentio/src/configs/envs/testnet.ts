import { defineConfig } from '../define-config.js';
import type { DeployedMarkets } from '../types.js';

export function createTestnetConfig() {
  return defineConfig({
    env: 'testnet',
    markets,
    assets,
  });
}

const markets: DeployedMarkets = {
  USDC: {
    marketAddress: '',
    startBlock: BigInt(37_000_000),
  },
};

const assets: Record<string, string> = {
  '0x899dbd3cf8955d7b64a02f8bde800e74c10cdd92b92330c42d7c75b0ddb3dbc4': 'USDC',
  '0x1317d8056c8504d7844b3871386ca1ec5e2ecf4743e0ca805378f9c48d4822d2': 'BTC',
  '0x31873ec08219b39ee601747f465c6a177010d94ed5eec945275c49a44a1ce4d0': 'UNI',
  '0x7bf88bdf02818cd03644998349704bb1f5c98615fb39c74e081081336e3c2c3b': 'ezETH',
  '0x2df42653712c4d413170eef9695d65a21013ac8be63891a2c5967c3af96a218f': 'USDT',
  '0xca119b2dd027d7be7061333bbb1d8bcab67bc0234cb30549322aba3ebd5ddf6a': 'sDAI',
  '0x9fb96f6fd9de9c63a67217188bc56cee04d2a54f732dd9899bed0aeb889b075b': 'weETH',
  '0x93dc2c176ee02ac5745272448775bf96f16fd1c31e7c3dca393eadab2d5dd43d':
    'wstETH',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
};
