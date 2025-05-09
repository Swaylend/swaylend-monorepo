import {ValidNetworkChainId} from "@shared/src/utils/constants";

import assets from "./verified-assets.json";

// TODO: Consider removing this type as we won't probably know the list of all coins ahead of time
export type CoinName = string | null;

export interface CoinData {
  name: string;
  assetId: string;
  decimals: number;
  symbol: string;
  icon?: string;
  contractId?: string;
  subId?: string;
  l1Address?: string;
  isVerified?: boolean;
  coinGeckoId?: string;
}

export interface CoinDataWithPrice extends CoinData {
  price: number;
}

// mapping of asset names & symbols to symbols
export const assetHandleToSymbol = new Map<string, string>();

// TODO: Make an API call to get the coins config
const initAssetsConfig = () => {
  const assetsConfig: Map<string, CoinData> = new Map();

  assets.forEach((asset) => {
    const assetData: CoinData = {
      name: asset.name,
      symbol: asset.symbol,
      assetId: asset.assetId!,
      decimals: asset.decimals,
      icon: asset.icon.default,
      isVerified: asset.isVerified,
      contractId: asset.contractId,
      subId: asset.subId,
    };

    assetsConfig.set(assetData.assetId, assetData);
  });

  const additionalAssetsConfig = initAdditionalAssetsConfig();

  additionalAssetsConfig.forEach((value, assetId) => {
    assetsConfig.set(assetId, value);
  });

  Array.from(assetsConfig.values()).forEach((asset) => {
    if (asset.name) {
      assetHandleToSymbol.set(asset.name, asset.name);
      assetHandleToSymbol.set(asset.symbol, asset.name);
    }
  });

  return assetsConfig;
};

const initAdditionalAssetsConfig = () => {
  const assetsConfig: Map<string, CoinData> = new Map();

  // place for additional assets
  const additionalAssets: CoinData[] = [
    {
      symbol: "PSYCHO",
      assetId:
        "0x86fa05e9fef64f76fa61c03f5906c87a03cb9148120b6171910566173d36fc9e",
      decimals: 9,
      name: "Psycho Ducky",
      icon: "https://mira-dex-resources.s3.us-east-1.amazonaws.com/icons/psycho-icon.png",
      contractId:
        "0x81d5964bfbb24fd994591cc7d0a4137458d746ac0eb7ececb9a9cf2ae966d942",
      subId:
        "0x0000000000000000000000000000000000000000000000000000000000000031",
      isVerified: false,
    },
    {
      symbol: "MEOW",
      assetId:
        "0x6ff822c3231932e232aad8ec62931f7a1f3a9653b25c75dd5609c75d03b228b7",
      decimals: 9,
      name: "Meow Meow",
      icon: "https://mira-dex-resources.s3.us-east-1.amazonaws.com/icons/meow-sm.jpg",
      contractId:
        "0x81d5964bfbb24fd994591cc7d0a4137458d746ac0eb7ececb9a9cf2ae966d942",
      subId:
        "0x0000000000000000000000000000000000000000000000000000000000000061",
      isVerified: false,
    },
    {
      symbol: "FPEPE",
      assetId:
        "0x7fb205b0048b5f17513355351b6be75eec086e26748a3a94dbe3dcca37d55814",
      decimals: 9,
      name: "Fuel Pepe",
      icon: "https://mira-dex-resources.s3.us-east-1.amazonaws.com/icons/fpepe.jpg",
      contractId:
        "0x81d5964bfbb24fd994591cc7d0a4137458d746ac0eb7ececb9a9cf2ae966d942",
      subId:
        "0x0000000000000000000000000000000000000000000000000000000000000023",
      isVerified: false,
    },
  ];

  for (const asset of additionalAssets) {
    assetsConfig.set(asset.assetId, asset);
  }

  return assetsConfig;
};

export const coinsConfig: Map<CoinName, CoinData> = initAssetsConfig();

// Routing configs

export const BASE_ASSETS: CoinData[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 9,
    assetId:
      "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
  },
  {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
    assetId:
      "0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b",
  },
];
