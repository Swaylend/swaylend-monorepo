import { z } from 'zod';

export const DeployedMarketsSchema = z.record(
  z.string(),
  z.object({
    pythOracleAddress: z.string(),
    redstoneOracleAddress: z.string(),
    marketAddress: z.string(),
    tokenFactoryAddress: z.string(),
    graphqlUrl: z.string(),
  })
);

export const RewardsSchema = z.record(
  z.string(),
  z.array(
    z.object({
      poolSize: z.number(),
      assetId: z.string(),
      supplyRewardPercentage: z.number(),
      borrowRewardPercentage: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      durationInDays: z.number(),
    })
  )
);

export const AppConfigSchema = z.object({
  env: z.enum(['testnet', 'mainnet']),
  client: z.object({
    swaylendApi: z.string(),
    posthogKey: z.string(),
    posthogHost: z.string(),
    hermesApi: z.string(),
    walletConnectProjectId: z.string(),
    fuelNodeUrl: z.string(),
    fuelExplorerUrl: z.string(),
    alchemyId: z.string(),
    fuelOblApi: z.string(),
    announcementEnabled: z.boolean(),
  }),
  server: z.object({
    sentioApi: z.string(),
    sentioApiKey: z.string(),
    sentioProcessorVersion: z.string(),
  }),
  markets: DeployedMarketsSchema,
  assets: z.record(z.string(), z.string()),
  baseAssetId: z.string(),
  useBurnerWallet: z.boolean(),
  rewards: RewardsSchema,
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DeployedMarkets = z.infer<typeof DeployedMarketsSchema>;
export type Rewards = z.infer<typeof RewardsSchema>;
