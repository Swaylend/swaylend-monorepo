import {
  ContractParamsProvider,
  convertDataPackagesResponse,
  type DataPackagesResponse,
  getOracleRegistryState,
  getSignersForDataServiceId,
} from '@redstone-finance/sdk';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify } from 'ethers/lib/utils';
import { DateTime } from 'fuels';
import { appConfig } from '@/configs';
import {
  type OracleInputInput,
  OracleTypeOutput,
} from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useRedstoneContract } from '@/contracts/v2/use-redstone-contract';
import { useMarketStore } from '@/stores/market-store';
import { useOraclePriceFeedData } from './use-oracle-price-feed-data';

export const useRedstoneOracle = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);
  const redstoneContract = useRedstoneContract(market);

  const { data: oraclePriceFeedData } = useOraclePriceFeedData(market);

  const redstonePriceFeedIds = oraclePriceFeedData?.oraclePriceFeeds.get(
    OracleTypeOutput.Redstone
  );

  const redstoneOracleId = oraclePriceFeedData?.oracleTypeToOracleId.get(
    OracleTypeOutput.Redstone
  );

  return useQuery({
    queryKey: [
      'redstonePrices',
      'v2',
      marketContract?.account?.address,
      marketContract?.id,
      redstoneContract?.account?.address,
      redstoneContract?.id,
      redstonePriceFeedIds,
      redstoneOracleId,
    ],
    queryFn: async () => {
      if (
        !(
          oraclePriceFeedData &&
          marketContract &&
          redstoneContract &&
          redstonePriceFeedIds &&
          redstoneOracleId
        )
      ) {
        return null;
      }

      const assetSymbols = redstonePriceFeedIds.map((priceFeedId) => {
        const assetId =
          oraclePriceFeedData.priceFeedIdToAssetId.get(priceFeedId);

        if (!assetId) {
          console.error('AssedId not found for priceFeedId', priceFeedId);
          return '';
        }

        return appConfig.client.shared.assets[assetId]!;
      });

      const oracleRegistry = await getOracleRegistryState();
      const dataPackageRequestParams = {
        dataServiceId: 'redstone-primary-prod',
        uniqueSignersCount: 2,
        authorizedSigners: getSignersForDataServiceId(
          oracleRegistry,
          'redstone-primary-prod'
        ),
        dataPackagesIds: assetSymbols,
      };

      const paramsProvider = new ContractParamsProvider(
        dataPackageRequestParams
      );

      const feed_ids = paramsProvider.getHexlifiedFeedIds();

      // This is passed to the contract
      const payload = await paramsProvider.getPayloadData();

      const pricesResponse = (
        await redstoneContract.functions.get_prices(feed_ids, payload).get()
      ).value;

      // Prepare the RedstoneOracleInput object
      const redstoneOracleInput: OracleInputInput = {
        Redstone: {
          oracle_id: redstoneOracleId,
          price_feed_ids: feed_ids,
          payload,
        },
      };

      // Format prices to BigNumber
      // AssetId -> Price
      const prices = new Map<string, BigNumber>();

      // Enumerate price feed ids
      for (let i = 0; i < feed_ids.length; i++) {
        const priceFeedId = feed_ids[i];
        const price = pricesResponse[0][i];

        const assetId =
          oraclePriceFeedData.priceFeedIdToAssetId.get(priceFeedId);

        if (assetId) {
          prices.set(
            assetId,
            BigNumber(price.toString()).div(BigNumber(10).pow(8))
          );
        }
      }

      const timestamp = DateTime.now();

      return {
        timestamp,
        prices,
        redstoneOracleInput,
        updateFee: BigNumber(0),
      };
    },
    refetchInterval: 20_000,
    enabled:
      !!oraclePriceFeedData &&
      !!marketContract &&
      !!redstoneContract &&
      !!redstonePriceFeedIds &&
      !!redstoneOracleId,
    staleTime: 20_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
};
