import {bn, CHAIN_IDS, TxParams} from "fuels";

export const DEFAULT_AMM_CONTRACT_ID =
  "0x2e40f2b244b98ed6b8204b3de0156c6961f98525c8162f80162fcf53eebd90e7" as const;

export const ETH_ASSET_ID =
  "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";
export const BASE_ASSET_CONTRACT =
  "0x7e2becd64cd598da59b4d1064b711661898656c6b1f4918a787156b8965dc83c";

export const USDC_ASSET_ID =
  "0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b";

export const FUEL_ASSET_ID =
  "0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82";

export const DefaultTxParams: TxParams = {
  gasLimit: 2_000_000,
  maxFee: 275_000,
} as const;

export const MaxDeadline = 4_294_967_295 as const;

export const DiscordLink = "https://discord.gg/6pHdTY6rYq" as const;
export const XLink = "https://x.com/MiraProtocol" as const;

export const BlogLink = "https://mirror.xyz/miraly.eth" as const;

// TODO: Use env variables for values below to separate dev/prod | testnet/mainnet
export const ValidNetworkChainId = CHAIN_IDS.fuel.testnet;
export const NetworkUrl: string = "https://mainnet.fuel.network/v1/graphql";

// Source: https://envio.dev/app/mira-amm/mira-indexer-mainnet
// playground: https://envio.dev/app/mira-amm/mira-indexer-mainnet/1b905cc/playground
export const IndexerUrl =
  "https://indexer.hyperindex.xyz/755fa3e/v1/graphql" as const;
export const SQDIndexerUrl =
  "https://mira-dex.squids.live/mira-indexer@v3/api/graphql" as const;
export const MainnetUrl = "https://mainnet-explorer.fuel.network";
export const ApiBaseUrl = "https://prod.api.mira.ly" as const;

export const FuelAppUrl = "https://app.fuel.network" as const;

export const FuelAssetPriceUrl =
  " https://explorer-indexer-mainnet.fuel.network/assets" as const;

export const EthDecimals = 9 as const;
export const MinEthValue = 0.0001 as const;
export const MinEthValueBN = MinEthValue * 10 ** EthDecimals;

export const MAX_U256 = bn(
  "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  16,
);

export const DefaultLocale = "en-US" as const;

export const CoinGeckoApiUrl = "https://pro-api.coingecko.com/api/v3" as const;

export const BASE_ASSETS = [ETH_ASSET_ID, USDC_ASSET_ID];

export const DisclaimerMessage = `Disclaimer
1. I am not a person or entity who resides in, is a citizen of, is incorporated in, or has a registered office in the United States of America or any other Prohibited Localities, as defined in the Terms of Use.

2. I will not access this site or use the Mira Dex protocol while located within the United States or any Prohibited Localities.

3. I am not using, and will not use in the future, a VPN or other tools to obscure my physical location from a restricted territory.

4. I am lawfully permitted to access this site and use the Mira Dex protocol under the laws of the jurisdiction in which I reside and am located.

5. I understand the risks associated with using decentralized protocols, including the Mira Dex protocol, as outlined in the Terms of Use and Privacy Policy.`;

export const BoostsLearnMoreUrl =
  "https://mirror.xyz/miraly.eth/X-80QWbrq4f17L67Yy8QyQBdE5y2okxTzcfJIL-SHCQ" as const;

export const LIQUIDITY_PROVIDING_DOC_URL =
  "https://docs.mira.ly/user-guides/how-to-add-liquidity" as const;

export const BoostsRewardsTooltip =
  "These are the total Fuel tokens earned that will be distributed at the end of the season. The exact dollar amount will change based on Fuel’s current price. The exact token amount might change.";

export const boostsEpochTooltip =
  "The current season is 7 days long. All remaining rewards will be distributed at the end of the season.";

export const RewardsApiUrl = "/api/rewards" as const;

export const boosterBannerTitle =
  " Introducing Boost Rewards, earn $FUEL by providing liquidity.";

export const POINTS_PROMO_TITLE =
  "Introducing Mira Points, earn points by providing liquidity and engaging in activities.";

export const EPOCH_NUMBER = 4 as const;

export const POINTS_TOOLTIP =
  "Your points are calculated based on the amount of liquidity you provide and the number of transactions you make.";

export const POINTS_RANK_TOOLTIP =
  "Your rank is determined by the amount of points you have accumulated.";

// TODO: Add the url for the points learn more
export const POINTS_LEARN_MORE_URL =
  "https://mirror.xyz/miraly.eth/W2W1Zv8jKS-70OY64cF-qneyPgLngG4ItRv9PMmxHeY";

export const POINTS_BANNER_TITLE = "Introducing Points";

export const POINTS_BANNER_SUBHEADER =
  "Earn MIRA points by providing liquidity and engaging in activities.";

export const SENTIO_POINTS_ENDPOINT =
  "https://endpoint.sentio.xyz/fuellabs/mira-mainnet/points-per-user-from-balance-table/async";

export const POSITIONS_SKELTON_COUNT = 3;
