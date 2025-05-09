import {PoolId} from "mira-dex-ts";
import {CoinData} from "../utils/coinsConfig";
import {skipToken, useQuery} from "@tanstack/react-query";
import request, {gql} from "graphql-request";
import {SQDIndexerUrl} from "../utils/constants";
import {useMemo} from "react";

type PoolReserveData = {
  reserve0: string;
  reserve1: string;
};

export type Pool = {
  assetA: CoinData;
  assetB: CoinData;
  poolId: PoolId;
} & PoolReserveData;

// export type Route = [Pool[], CoinData, CoinData];

export type Route = {
  pools: Pool[];
  assetIn: CoinData;
  assetOut: CoinData;
};

const useGetPoolsWithReserve = (
  poolKeys: [CoinData, CoinData, PoolId, boolean][],
  assetIn?: CoinData,
  assetOut?: CoinData,
  shouldFetchPools: boolean = false,
) => {
  const poolQueries = poolKeys
    .map(([, , [assetA, assetB], stable], idx) => {
      const poolId = `${assetA.bits}-${assetB.bits}-${stable}`;
      const alias = String.fromCharCode(97 + idx); // 'a', 'b', 'c' ....
      return `${alias}: poolById(id: "${poolId}") {
            ...PoolFragment
          }`;
    })
    .join("\n");

  const gqlQuery = gql`
    query MultiPoolReserve {
        ${poolQueries}
    }
    fragment PoolFragment on Pool {
        reserve0
        reserve1
    }
`;

  const {
    isLoading,
    data: poolReserveData,
    isRefetching,
    refetch,
  } = useQuery<Record<string, PoolReserveData | null>>({
    queryKey: [
      "routable-pools",
      shouldFetchPools,
      assetIn?.assetId,
      assetOut?.assetId,
    ],
    queryFn: shouldFetchPools
      ? () =>
          request({
            url: SQDIndexerUrl,
            document: gqlQuery,
          })
      : skipToken,
    refetchInterval: 10 * 1000, // 10 seconds
  });

  // create all possible pools by excluding pools without liquidity (null) from indexer
  const poolsWithReserve = useMemo(
    () =>
      poolReserveData && poolKeys.length
        ? poolKeys.reduce<Pool[]>((pools, [assetA, assetB, poolId], idx) => {
            const alias = String.fromCharCode(97 + idx);
            return poolReserveData[alias]
              ? pools.concat({
                  assetA,
                  assetB,
                  poolId,
                  ...poolReserveData[alias],
                })
              : pools;
          }, [])
        : [],
    [poolKeys, poolReserveData],
  );

  return {
    pools: poolsWithReserve,
    isLoading,
    isRefetching,
    refetch,
  };
};

export default useGetPoolsWithReserve;
