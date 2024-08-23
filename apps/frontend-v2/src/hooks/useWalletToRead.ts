import { walletToRead } from '@/utils/walletToRead';
import type { WalletUnlocked } from 'fuels';
import React, { useEffect, useState } from 'react';

export const useWalletToRead = () => {
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
  }, []);

  return wallet;
};
