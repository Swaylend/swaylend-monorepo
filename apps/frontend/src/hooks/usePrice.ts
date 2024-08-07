import {
  PYTH_CONTRACT_ABI,
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
} from '@pythnetwork/pyth-fuel-js';
import BN from '@src/utils/BN';
import { initProvider, walletToRead } from '@src/utils/walletToRead';
import { useQueries } from '@tanstack/react-query';
import { Contract, type Provider, type WalletUnlocked } from 'fuels';
import { useEffect, useState } from 'react';

const PRICE_FEEDS = {
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': {
    symbol: 'Crypto.ETH/USD',
    id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  },
  '0xb3a405892c0725ae9cfc117306752f623e3f357963b7489636b83d4842f96d62': {
    symbol: 'Crypto.BTC/USD',
    id: '0x56a3121958b01f99fdc4e1fd01e81050602c7ace3a571918bb55c6a96657cca9',
  },
  '0x403489ee55a733cce6deb3e46e16a0ded38f902ff70224df97e15c243319b6f3': {
    symbol: 'Crypto.USDC/USD',
    id: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
};

export const usePrice = (assetIds: string[]) => {
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
    initProvider().then((p) => setProvider(p));
  }, []);

  const oracleContract = new Contract(
    PYTH_CONTRACT_ADDRESS_SEPOLIA,
    PYTH_CONTRACT_ABI,
    wallet!
  );

  const fetchPrice = async (assetId: string) => {
    if (
      assetId ===
      '0xb3a405892c0725ae9cfc117306752f623e3f357963b7489636b83d4842f96d62'
    )
      return new BN(66292.123);

    if (
      assetId !==
        '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07' &&
      assetId !==
        '0xb3a405892c0725ae9cfc117306752f623e3f357963b7489636b83d4842f96d62' &&
      assetId !==
        '0x403489ee55a733cce6deb3e46e16a0ded38f902ff70224df97e15c243319b6f3'
    )
      throw new Error('Invalid assetId');
    const { value } = await oracleContract.functions
      .price_unsafe(PRICE_FEEDS[assetId].id)
      .get();
    if (!value) throw new Error('Failed to fetch price');

    const previousPrice = value.price.toNumber() * 10 ** -value.exponent;

    return new BN(previousPrice.toString());
  };
  const results = useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: ['priceOf', assetId],
      queryFn: () => fetchPrice(assetId),
      enabled: !!provider || !!wallet,
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

  const getPrice = (assetId: string) => {
    return data[assetId] ?? BN.ZERO;
  };

  const getFormattedPrice = (assetId: string): string => {
    if (!data[assetId]) return '$ 0.00';
    const price = data[assetId];
    return `$${price.toFormat(2)}`;
  };

  return {
    data,
    isLoading: results.some((res) => res.isLoading),
    isError: results.some((res) => res.isError),
    refetch,
    getPrice,
    getFormattedPrice,
  };
};
