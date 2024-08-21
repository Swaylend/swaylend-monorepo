'use client';
import { useIsConnected, useWallet } from '@fuels/react';
import { BN, CoinQuantity } from 'fuels';
import { useEffect, useMemo, useState } from 'react';

const useBalances = (assetId: string[]) => {
  // make an object where the key is the assetId and the value is BN(0)
  const balances: { [key: string]: BN } = {};
  assetId.forEach((id) => {
    balances[id] = new BN(0);
  });

  const [result, setResult] = useState<Record<string, BN>>(balances);
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();

  useEffect(() => {
    if (!isConnected || !wallet) {
      setResult(balances);
      return;
    }
    wallet.getBalances().then((res) => {
      assetId.forEach((id) => {
        balances[id] =
          res.balances.find((r) => r.assetId === id)?.amount ?? new BN(0);
      });
      setResult(balances);
    });
  }, [wallet]);

  return result;
};

export default useBalances;
