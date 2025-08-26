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
    marketAddress:
      '0x2b2b991023784e531e5b413ba4729abeb7f959d7bf5ad73da82e4c8c1aaada89',
    startBlock: BigInt(37_000_000),
  },
  USDT: {
    marketAddress:
      '0x45462cd7c1e5e17984a208447bf39150b3c3c667f1bda6c93ffe0c20fc7d3ae2',
    startBlock: BigInt(37_000_000),
  },
};

const assets: Record<string, string> = {
  '0x3aced3c270121c9d85e00fb14f079ecc666b733b12a0d15df1c2ecae26c1167a': 'USDC',
  '0xc264acd28eaf6f33e0e13360a37741dc91221aaa8817e1b4e462d61bb08c5835': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0x506442d6926065fe53dd09870b7392dd46bfe39b761ab347b11cc2e1f8874250': 'BTC',
  '0xa95097d8fe21970639e543db9b7f590aa678f325bce3dbc12a682cdcbbfae378': 'UNI',
  '0xf3e2b3960e0930402a5d6047883f5c178a30aa5db2f0d7302d582cefb59a1575': 'BTC',
  '0x790d2c0eb869e72cf42540d928ce728c253142d5ef07ed22b75009e40660e4ea': 'BNB',
  '0x24dd639420a98a5d9d3015280e82cafefb3b88d75f996107d1a3b12da831f733': 'ezETH',
  '0xf30eade9911f75e819deff8fa76f7cf54c477180c756f5a9c3db6fe1986fe485': 'USDT',
  '0x66be991ed1fe4217520bdfc25a767e9dbf24e3c7ed411d6c1cd51a7c0b6d0d24': 'sDAI',
  '0x0526a5a33267abf138d40be4a1bd982bfb00365310891c6e7e13d0d8e7c3fc23': 'weETH',
  '0x62fb3f091da88a3a520fa7b7fd12fa1ab3cbf306d57a66e345b6e9b0b883d0c2':
    'wstETH',
  '0x899dbd3cf8955d7b64a02f8bde800e74c10cdd92b92330c42d7c75b0ddb3dbc4': 'USDC',
  '0x1317d8056c8504d7844b3871386ca1ec5e2ecf4743e0ca805378f9c48d4822d2': 'BTC',
  '0x31873ec08219b39ee601747f465c6a177010d94ed5eec945275c49a44a1ce4d0': 'UNI',
  '0x7bf88bdf02818cd03644998349704bb1f5c98615fb39c74e081081336e3c2c3b': 'ezETH',
  '0x2df42653712c4d413170eef9695d65a21013ac8be63891a2c5967c3af96a218f': 'USDT',
  '0xca119b2dd027d7be7061333bbb1d8bcab67bc0234cb30549322aba3ebd5ddf6a': 'sDAI',
  '0x9fb96f6fd9de9c63a67217188bc56cee04d2a54f732dd9899bed0aeb889b075b': 'weETH',
  '0x93dc2c176ee02ac5745272448775bf96f16fd1c31e7c3dca393eadab2d5dd43d':
    'wstETH',
};
