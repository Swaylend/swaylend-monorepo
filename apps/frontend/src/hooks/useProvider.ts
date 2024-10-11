import { selectProvider, useProviderStore } from '@/stores';

export const useProvider = () => {
  return useProviderStore(selectProvider);
};
