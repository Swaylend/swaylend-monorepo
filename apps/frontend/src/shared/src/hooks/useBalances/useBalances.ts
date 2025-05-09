import {useAccount, useWallet} from "@fuels/react";
import {useQuery} from "@tanstack/react-query";

const useBalances = () => {
  const {account} = useAccount();
  const {wallet} = useWallet({account});

  const {data, isPending, refetch} = useQuery({
    queryKey: ["balances", wallet?.address],
    queryFn: async () => {
      if (!wallet) {
        return null;
      }

      return wallet.getBalances();
    },
    enabled: Boolean(wallet),
  });

  return {
    balances: data?.balances,
    balancesPending: isPending,
    refetchBalances: refetch,
  };
};

export default useBalances;
