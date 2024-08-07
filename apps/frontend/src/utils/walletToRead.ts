import { NODE_URL } from '@src/constants';
import { Provider, Wallet, type WalletUnlocked } from 'fuels';

export const initProvider = async () => {
  return await Provider.create(NODE_URL);
};

export async function walletToRead(): Promise<WalletUnlocked | null> {
  const provider = await initProvider();
  return Wallet.fromPrivateKey(
    '0x737439a8dc69c0adc72501ae4becb0c7c39981914d3b664bd511b48af7333661',
    provider
  );
}
