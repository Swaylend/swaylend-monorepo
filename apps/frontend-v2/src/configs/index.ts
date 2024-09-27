import { createTestnetConfig } from './envs/testnet';
import { createMainnetConfig } from './envs/mainnet';

export const appConfig = getConfig();

function getConfig() {
  switch (process.env.NEXT_PUBLIC_APP_ENV) {
    case 'mainnet':
      return createMainnetConfig();
    case 'testnet':
      return createTestnetConfig();
    default:
      throw new Error(`Invalid APP_ENV "${process.env.NEXT_PUBLIC_APP_ENV}"`);
  }
}
