import { Provider } from 'fuels';
import { NODE_URL } from './constants';

export const initProvider = async () => {
  return await Provider.create(NODE_URL);
};
