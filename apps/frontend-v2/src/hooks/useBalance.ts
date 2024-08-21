'use client';
import { useIsConnected, useWallet } from '@fuels/react';
import { BN } from 'fuels';
import { useEffect, useMemo, useState } from 'react';

const useBalance = (assetId: string) => {
  const [result, setResult] = useState<BN>(new BN(0));
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();

  useEffect(() => {
    if (!isConnected || !wallet) {
      setResult(new BN(0));
      return;
    }
    wallet.getBalance(assetId).then((balance) => {
      setResult(balance);
    });
  }, [wallet]);

  return result;
};

export default useBalance;
