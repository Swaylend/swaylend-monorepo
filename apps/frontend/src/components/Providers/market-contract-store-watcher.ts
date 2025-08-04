'use client';

import { useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { useEffect } from 'react';
import { appConfig } from '@/configs';
import { Market as MarketV1 } from '@/contract-types/v1';
import { Market as MarketV2, RedstonePrices } from '@/contract-types/v2';
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
      const pythContract = new PythContract(
        appConfig.client.v1.markets[market].oracleAddress,
        walletOrProvider
      );

      const marketContract = new MarketV1(
        appConfig.client.v1.markets[market].marketAddress,
        walletOrProvider
      );

      updateContractsV1(market, pythContract, marketContract);
    }

    for (const market of Object.keys(appConfig.client.v2.markets)) {
      // TODO[v2]: Optimize by using the same oracle instance for all markets
      const pythContract = new PythContract(
        appConfig.client.v2.markets[market].pythAddress,
        walletOrProvider
      );

      const marketContract = new MarketV2(
        appConfig.client.v2.markets[market].marketAddress,
        walletOrProvider
      );

      const redstoneContract = new RedstonePrices(
        appConfig.client.v2.markets[market].redstoneAddress,
        walletOrProvider
      );

      updateContractsV2(market, pythContract, marketContract, redstoneContract);
    }
  }, [walletOrProvider]);

  return null;
}
