import { createMainnetConfig } from './envs/mainnet';
import { createTestnetConfig } from './envs/testnet';

export const appConfig = getConfig();

function getConfig() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'testnet';
  switch (appEnv) {
    case 'mainnet':
      return createMainnetConfig();
    case 'testnet':
      return createTestnetConfig();
    default:
      throw new Error(`Invalid APP_ENV "${process.env.NEXT_PUBLIC_APP_ENV}"`);
  }
}
