import { z } from 'zod';

export const DeployedMarketsV1Schema = z.record(
  z.string(),
  z.object({
    oracleAddress: z.string(),
    marketAddress: z.string(),
    tokenFactoryAddress: z.string(),
    graphqlUrl: z.string(),
  })
);

export const DeployedMarketsV2Schema = z.record(
  z.string(),
  z.object({
    pythAddress: z.string(),
    redstoneAddress: z.string(),
    storkAddress: z.string(),
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
    shared: z.object({
      swaylendApi: z.string(),
      posthogKey: z.string(),
      posthogHost: z.string(),
      hermesApi: z.string(),
      walletConnectProjectId: z.string(),
      fuelNodeUrl: z.string(),
      fuelExplorerUrl: z.string(),
      alchemyId: z.string(),
      baseAssetId: z.string(),
      assets: z.record(z.string(), z.string()),
      marketAddressToBaseAssetName: z.record(z.string(), z.string()),
      useBurnerWallet: z.boolean(),
    }),
    v1: z.object({
      announcementEnabled: z.boolean(),
      sentioApi: z.string(),
      sentioApiKey: z.string(),
      sentioProcessorVersion: z.string(),
      markets: DeployedMarketsV1Schema,
      rewards: RewardsSchema,
    }),
    v2: z.object({
      announcementEnabled: z.boolean(),
      sentioApi: z.string(),
      sentioApiKey: z.string(),
      sentioProcessorVersion: z.string(),
      markets: DeployedMarketsV2Schema,
      rewards: RewardsSchema,
    }),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DeployedMarketsV1 = z.infer<typeof DeployedMarketsV1Schema>;
export type DeployedMarketsV2 = z.infer<typeof DeployedMarketsV2Schema>;
export type Rewards = z.infer<typeof RewardsSchema>;
