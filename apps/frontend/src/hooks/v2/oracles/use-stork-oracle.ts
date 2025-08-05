import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { bn, DateTime } from 'fuels';
import { appConfig } from '@/configs';
import type {
  I128Input,
  TemporalNumericValueInput,
  TemporalNumericValueInputInput,
} from '@/contract-types/stork/Stork';
import {
  type OracleInputInput,
  OracleTypeOutput,
} from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useStorkContract } from '@/contracts/v2/use-stork-contract';
import { useMarketStore } from '@/stores/market-store';
import { useOraclePriceFeedData } from './use-oracle-price-feed-data';

const regex = /(?<!["\d])\b\d{16,}\b(?!["])/g;

function stringToI128Input(value: string): I128Input {
  const valueBn = bn(value);
  const indent = bn(1).shln(127);
  const valueBnWithIndent = valueBn.add(indent);

  const mask64Bits = bn('18446744073709551615'); // 2^64 - 1
  const upper = valueBnWithIndent.shrn(64);
  const lower = valueBnWithIndent.and(mask64Bits);

  return {
    underlying: {
      upper: upper.toString(),
      lower: lower.toString(),
    },
  };
}

export const useStorkOracle = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);
  const storkContract = useStorkContract(market);

  const { data: oraclePriceFeedData } = useOraclePriceFeedData(market);

  const storkPriceFeedIds = oraclePriceFeedData?.oraclePriceFeeds.get(
    OracleTypeOutput.Stork
  );

  const storkOracleId = oraclePriceFeedData?.oracleTypeToOracleId.get(
    OracleTypeOutput.Stork
  );

  return useQuery({
    queryKey: [
      'storkPrices',
      'v2',
      marketContract?.account?.address,
      marketContract?.id,
      storkPriceFeedIds,
      storkOracleId,
    ],
    queryFn: async () => {
      if (
        !(
          oraclePriceFeedData &&
          marketContract &&
          storkPriceFeedIds &&
          storkOracleId &&
          storkContract
        )
      ) {
        return null;
      }

      const assetSymbols = storkPriceFeedIds.map((priceFeedId) => {
        const assetId =
          oraclePriceFeedData.priceFeedIdToAssetId.get(priceFeedId);

        if (!assetId) {
          console.error('AssedId not found for priceFeedId', priceFeedId);
          return '';
        }

        return appConfig.client.shared.assets[assetId]!;
      });

      const response = await fetch(
        `/api/stork?priceFeedIds=${assetSymbols
          .map((symbol) => `"${symbol.toUpperCase()}USD"`)
          .join(',')}`
      );

      const data = await response.json();
      const rawJson = data.rawJson as string;
      const safeJsonText = rawJson.replace(regex, (match) => `"${match}"`);
      const responseData = JSON.parse(safeJsonText);

      const updateData: TemporalNumericValueInputInput[] = [];
      const prices = new Map<string, BigNumber>();

      // Ref: https://github.com/Stork-Oracle/stork-external/blob/8c6b7ea9012a3f247f88be452ea4196d02fc8a64/contracts/fuel/cli/admin.ts#L155
      for (const data of Object.values(responseData.data)) {
        // Remove last part (USD) from asset id
        const assetId = ((data as any).asset_id as string).slice(-3);
        const storkSignedPrice = (data as any).stork_signed_price as any;
        const id: string = storkSignedPrice.encoded_asset_id;
        const recvTime: string =
          storkSignedPrice.timestamped_signature.timestamp;
        const quantizedValue: string = storkSignedPrice.price;
        const publisherMerkleRoot: string =
          storkSignedPrice.publisher_merkle_root;
        const valueComputeAlgHash: string = `0x${storkSignedPrice.calculation_alg.checksum}`;
        const r: string = storkSignedPrice.timestamped_signature.signature.r;
        const s: string = storkSignedPrice.timestamped_signature.signature.s;
        const v: string = storkSignedPrice.timestamped_signature.signature.v;

        // construct quantized value
        const quantizedValueInput: I128Input =
          stringToI128Input(quantizedValue);

        // construct temporal numeric value
        const temporalNumericValue: TemporalNumericValueInput = {
          timestamp_ns: bn(recvTime),
          quantized_value: quantizedValueInput,
        };

        // convert v hex string to number
        const vNumber = Number.parseInt(v.slice(2), 16);

        const temporalNumericValueInput: TemporalNumericValueInputInput = {
          temporal_numeric_value: temporalNumericValue,
          id,
          publisher_merkle_root: publisherMerkleRoot,
          value_compute_alg_hash: valueComputeAlgHash,
          r,
          s,
          v: vNumber,
        };

        updateData.push(temporalNumericValueInput);

        prices.set(
          assetId,
          new BigNumber(quantizedValue).div(BigNumber(10).pow(18))
        );
      }

      const storkOracleInput: OracleInputInput = {
        Stork: {
          oracle_id: storkOracleId,
          update_data: updateData,
        },
      };

      // Get update fee
      const { value: fee } = await storkContract.functions
        .get_update_fee_v1(updateData)
        .get();

      const timestamp = DateTime.now();

      return {
        timestamp,
        prices,
        storkOracleInput,
        updateFee: BigNumber(fee.toString()),
      };
    },
    refetchInterval: 20_000,
    enabled: !!oraclePriceFeedData && !!marketContract && !!storkContract,
    staleTime: 20_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
};
