import { z } from 'zod';

export const DeployedMarketsSchema = z.record(
  z.string(),
  z.object({
    marketAddress: z.string(),
    startBlock: z.bigint(),
  })
);

export const AppConfigSchema = z.object({
  env: z.enum(['testnet', 'mainnet']),
  markets: DeployedMarketsSchema,
  assets: z.record(z.string(), z.string()),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DeployedMarkets = z.infer<typeof DeployedMarketsSchema>;
