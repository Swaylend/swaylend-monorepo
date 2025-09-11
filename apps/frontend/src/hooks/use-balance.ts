import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Address, type BytesLike } from 'fuels';
import { useProvider } from './use-provider';

type UseBalanceParams = {
  address?: string;
  assetId?: BytesLike;
};

export const useBalance = ({ address, assetId }: UseBalanceParams) => {
  const { provider } = useProvider();

  return useQuery({
    // Unified query key for both versions to enable cache sharing
    queryKey: ['balance', address, assetId],
    queryFn: async () => {
      if (!(provider && address && assetId)) return null;

      const currentFuelBalance = await provider.getBalance(
        new Address(address),
        assetId
      );

      return currentFuelBalance || null;
    },
    enabled: !!provider,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
