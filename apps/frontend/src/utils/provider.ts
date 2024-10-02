import { appConfig } from '@/configs';
import { Provider } from 'fuels';

export const initProvider = async () => {
  console.log('initing provider...');
  return await Provider.create(appConfig.client.fuelNodeUrl);
};
