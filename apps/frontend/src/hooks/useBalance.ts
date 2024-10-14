import { useProvider } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Address, type BytesLike } from 'fuels';

type UseBalanceParams = {
  address?: string;
  assetId?: BytesLike;
};

export const useBalance = ({ address, assetId }: UseBalanceParams) => {
  const { provider } = useProvider();

  return useQuery({
    queryKey: ['balance', address, assetId],
    queryFn: async () => {
      if (!provider || !address) return null;

      const currentFuelBalance = await provider.getBalance(
        Address.fromString(address),
        assetId ?? provider.getBaseAssetId() // Use the base asset ID if no asset ID is provided
      );

      return currentFuelBalance || null;
    },
    initialData: null,
    enabled: !!provider,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
};
