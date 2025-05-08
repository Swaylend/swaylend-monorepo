import { appConfig } from '@/configs';
import { useRedstoneContract } from '@/contracts/useRedstoneContract';
import { selectMarket, useMarketStore } from '@/stores';
import {
  ContractParamsProvider,
  getOracleRegistryState,
  getSignersForDataServiceId,
} from '@redstone-finance/sdk';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';

export const useRedstonePrice = (marketParam?: string) => {
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;

  const { data: marketConfiguration } = useMarketConfiguration(market);
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);

  const redstoneContract = useRedstoneContract(market);

  const assetIdToSymbol = useMemo(() => {
    if (!marketConfiguration || !collateralConfigurations) return null;

    const assets: Map<string, string> = new Map();

    assets.set(
      marketConfiguration.baseToken.bits,
      appConfig.assets[marketConfiguration.baseToken.bits]
    );

    for (const [assetId] of Object.entries(collateralConfigurations)) {
      assets.set(assetId, appConfig.assets[assetId]);
    }

    return assets;
  }, [marketConfiguration, collateralConfigurations]);

  return useQuery({
    queryKey: ['redstonePrices', assetIdToSymbol, market],
    queryFn: async () => {
      if (!assetIdToSymbol || !redstoneContract) {
        return null;
      }

      try {
        const oracleRegistry = await getOracleRegistryState();
        const dataPackageRequestParams = {
          dataServiceId: 'redstone-primary-prod',
          uniqueSignersCount: 3,
          authorizedSigners: getSignersForDataServiceId(
            oracleRegistry,
            'redstone-primary-prod'
          ),
          dataPackagesIds: Array.from(assetIdToSymbol.values()),
        };
        const paramsProvider = new ContractParamsProvider(
          dataPackageRequestParams
        );
        // Pass both to swaylend contract for contract price update
        const payload = await paramsProvider.getPayloadData(); // payload
        const feed_ids = paramsProvider.getHexlifiedFeedIds(); // feed_ids

        const adapter = await redstoneContract.getAdapter();

        if (adapter) {
          const prices = await adapter.getPricesFromPayload(paramsProvider);

          const formattedPrices = Object.fromEntries(
            prices.map((value, index) => [
              [...assetIdToSymbol.keys()][Number(index)],
              BigNumber(utils.formatUnits(value, 8)),
            ])
          );

          return {
            prices: formattedPrices,
            priceUpdateData: { payload, feed_ids },
          };
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    refetchInterval: 5000,
    enabled: !!assetIdToSymbol && !!redstoneContract,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
};
