import { z } from 'zod';

export const DeployedMarketsSchema = z.record(
  z.string(),
  z.object({
    oracleAddress: z.string(),
    marketAddress: z.string(),
    tokenFactoryAddress: z.string(),
    graphqlUrl: z.string(),
  })
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
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DeployedMarkets = z.infer<typeof DeployedMarketsSchema>;
