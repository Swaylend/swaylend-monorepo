'use client';

import { useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { useEffect } from 'react';
import { appConfig } from '@/configs';
import { Market as MarketV1 } from '@/contract-types/v1';
import { Market as MarketV2 } from '@/contract-types/v2';
import { useProvider } from '@/hooks';
import { useMarketAddressBasedContractsStore as useMarketAddressBasedContractsStoreV1 } from '@/stores/v1/market-address-based-contract-store';
import { useMarketAddressBasedContractsStore as useMarketAddressBasedContractsStoreV2 } from '@/stores/v2/market-address-based-contract-store';

export default function MarketContractStoreWatcher(): null {
  const { wallet } = useWallet();
  const updateContractsV1 =
    useMarketAddressBasedContractsStoreV1.use.updateContracts();
  const updateContractsV2 =
    useMarketAddressBasedContractsStoreV2.use.updateContracts();
  const { provider } = useProvider();
  const walletOrProvider = wallet || provider;

  useEffect(() => {
    if (!walletOrProvider) return;

    for (const market of Object.keys(appConfig.client.v1.markets)) {
      const pythContractV1 = new PythContract(
        appConfig.client.v1.markets[market].oracleAddress,
        walletOrProvider
      );

      const marketContractV1 = new MarketV1(
        appConfig.client.v1.markets[market].marketAddress,
        walletOrProvider
      );

      const pythContractV2 = new PythContract(
        appConfig.client.v2.markets[market].oracleAddress,
        walletOrProvider
      );

      const marketContractV2 = new MarketV2(
        appConfig.client.v2.markets[market].marketAddress,
        walletOrProvider
      );

      updateContractsV1(market, pythContractV1, marketContractV1);
      updateContractsV2(market, pythContractV2, marketContractV2);
    }
  }, [walletOrProvider]);

  return null;
}
