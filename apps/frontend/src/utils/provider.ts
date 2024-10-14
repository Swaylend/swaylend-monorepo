import { appConfig } from '@/configs';
import { Provider } from 'fuels';

export const initProvider = async () => {
  console.log('Initializing Fuel provider...');
  return await Provider.create(appConfig.client.fuelNodeUrl);
};
