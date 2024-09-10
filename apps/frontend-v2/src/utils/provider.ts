import { Provider } from 'fuels';
import { NODE_URL } from './constants';

export const initProvider = async () => {
  console.log('initing provider...');
  return await Provider.create(NODE_URL);
};
