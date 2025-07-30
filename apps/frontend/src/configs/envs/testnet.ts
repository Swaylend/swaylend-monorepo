import { defineConfig } from '../define-config';
import type { DeployedMarkets, Rewards } from '../types';

export function createTestnetConfig() {
  return defineConfig({
    env: 'testnet',
    client: {
      shared: {
        swaylendApi: process.env.NEXT_PUBLIC_SWAYLEND_API ?? '',
        posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
        posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '',
        hermesApi: process.env.NEXT_PUBLIC_HERMES_API ?? '',
        walletConnectProjectId:
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
        fuelExplorerUrl: process.env.NEXT_PUBLIC_FUEL_EXPLORER_URL ?? '',
        fuelNodeUrl: process.env.NEXT_PUBLIC_FUEL_NODE_URL ?? '',
        alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID ?? '',
        baseAssetId:
          '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
        assets: assets,
        useBurnerWallet: true,
        marketAddressToBaseAssetName: marketAddressToBaseAssetName,
      },
      v1: {
        announcementEnabled:
          process.env.NEXT_PUBLIC_V1_ANNOUNCEMENT_ENABLED === 'true',
        sentioApi: process.env.NEXT_PUBLIC_V1_SENTIO_API_URL ?? '',
        sentioApiKey: process.env.NEXT_PUBLIC_V1_SENTIO_API_KEY ?? '',
        sentioProcessorVersion:
          process.env.NEXT_PUBLIC_V1_SENTIO_PROCESSOR_VERSION ?? '',
        markets: markets_v1,
        rewards: rewards_v1,
      },
      v2: {
        announcementEnabled:
          process.env.NEXT_PUBLIC_V2_ANNOUNCEMENT_ENABLED === 'true',
        sentioApi: process.env.NEXT_PUBLIC_V2_SENTIO_API_URL ?? '',
        sentioApiKey: process.env.NEXT_PUBLIC_V2_SENTIO_API_KEY ?? '',
        sentioProcessorVersion:
          process.env.NEXT_PUBLIC_V2_SENTIO_PROCESSOR_VERSION ?? '',
        markets: markets_v2,
        rewards: rewards_v2,
      },
    },
  });
}

const rewards_v1: Rewards = {
  USDC: [
    {
      poolSize: 200,
      assetId:
        '0x3aced3c270121c9d85e00fb14f079ecc666b733b12a0d15df1c2ecae26c1167a',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-07T00:00:00Z',
      endDate: '2025-01-14T00:00:00Z',
      durationInDays: 7,
    },
    {
      poolSize: 400,
      assetId:
        '0x3aced3c270121c9d85e00fb14f079ecc666b733b12a0d15df1c2ecae26c1167a',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-14T00:00:00Z',
      endDate: '2025-01-21T00:00:00Z',
      durationInDays: 7,
    },
    {
      poolSize: 800,
      assetId:
        '0x3aced3c270121c9d85e00fb14f079ecc666b733b12a0d15df1c2ecae26c1167a',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-21T00:00:00Z',
      endDate: '2025-01-28T00:00:00Z',
      durationInDays: 7,
    },
  ],
  USDT: [
    {
      poolSize: 200,
      assetId:
        '0xc264acd28eaf6f33e0e13360a37741dc91221aaa8817e1b4e462d61bb08c5835',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-11T00:00:00Z',
      endDate: '2025-01-14T00:00:00Z',
      durationInDays: 7,
    },
  ],
};

const rewards_v2: Rewards = {
  USDC: [],
};

const markets_v1: DeployedMarkets = {
  USDC: {
    oracleAddress:
      '0x25146735b29d4216639f7f8b1d7b921ff87a1d3051de62d6cceaacabeb33b8e7',
    marketAddress:
      '0xc95ba29f6172eccb58d489f9db30374ee593fadf962d215b33e79d2be2534ec1',
    tokenFactoryAddress:
      '0x3e4f1948aece07d3f30c8c5c425f914ac74653827de48394466f2a887eebe9c7',
    graphqlUrl: '',
  },
  USDT: {
    oracleAddress:
      '0x25146735b29d4216639f7f8b1d7b921ff87a1d3051de62d6cceaacabeb33b8e7',
    marketAddress:
      '0x51b9bea7822988e03520018f4a1bb39b9f5ba15c9b4b9c9340a6bc1e5958abd4',
    tokenFactoryAddress:
      '0x1ea9a306a5f280cfe7bd1fdc96815a6438069668e495a2f5a727c7b9b90691cb',
    graphqlUrl: '',
  },
};

const markets_v2: DeployedMarkets = {
  USDC: {
    oracleAddress: '',
    marketAddress: '',
    tokenFactoryAddress: '',
    graphqlUrl: '',
  },
};

const marketAddressToBaseAssetName: Record<string, string> = {
  '0x6030cf103746576706d7dcc2ae6f6b32ba0db66907a8f9901a0170de5f06acc0': 'USDC',
  '0x51b9bea7822988e03520018f4a1bb39b9f5ba15c9b4b9c9340a6bc1e5958abd4': 'USDT',
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
};
