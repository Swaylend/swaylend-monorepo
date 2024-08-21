'use client';
import { getQueryClient } from '@/components/Providers';
import { useIsConnected, useWallet } from '@fuels/react';
import {
  type QueryFilters,
  useMutation,
  useQueries,
} from '@tanstack/react-query';
import { BN, CoinQuantity } from 'fuels';
import { useMemo } from 'react';

const useBalances = (assetIds: string[]) => {
  const queryClient = getQueryClient();
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();

  const fetchBalance = async (assetId: string) => {
    const balance = await wallet?.getBalance(assetId);
    if (!balance) return new BN(0);
    return balance;
  };

  const results = useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: ['balanceOf', assetId],
      queryFn: () => fetchBalance(assetId),
      enabled: !!wallet && isConnected,
    })),
  });

  const data = results.reduce((acc, res, index) => {
    if (!res.data) return acc;
    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
    return { ...acc, [assetIds[index]]: res.data };
  }, {}) as Record<string, BN>;

  const refetch = () => {
    results.forEach((res) => res.refetch());
  };

  const getBalance = (assetId: string) => {
    return data[assetId] ?? new BN(0);
  };

  useMemo(() => {
    if (isConnected) {
      setTimeout(() => {
        refetch();
      }, 100);
    }
  }, [isConnected, wallet]);

  useMemo(() => {
    if (!isConnected)
      queryClient.removeQueries('balanceOf' as unknown as QueryFilters);
  }, [isConnected]);

  return {
    data,
    isLoading: results.some((res) => res.isLoading),
    isError: results.some((res) => res.isError),
    refetch,
    getBalance,
  };
};

export default useBalances;
