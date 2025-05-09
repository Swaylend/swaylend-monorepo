import {useMemo} from "react";
import {CoinData} from "../utils/coinsConfig";
import {useAllAssetsCombination} from "./useAllAssetsCombination";
import {buildPoolId, PoolId} from "mira-dex-ts";
import useGetPoolsWithReserve, {Pool, Route} from "./useGetPoolsWithReserve";

const involvesAssetInPool = (pool: Pool, asset: CoinData): boolean =>
  pool.assetA.assetId === asset.assetId ||
  pool.assetB.assetId === asset.assetId;

const poolEquals = (poolA: Pool, poolB: Pool): boolean => {
  return (
    poolA === poolB ||
    poolA.poolId.every((id, index) => id === poolB.poolId[index])
  );
};

function computeAllRoutes(
  assetIn: CoinData,
  assetOut: CoinData,
  pools: Pool[],
  currentPath: Pool[] = [],
  allPaths: Route[] = [],
  startAssetIn: CoinData = assetIn,
  maxHops = 2, // maximum number of intermediate assets (or pools) allowed for the swap
): Route[] {
  if (!assetIn || !assetOut) throw new Error("Missing tokenIn/tokenOut");

  for (const pool of pools) {
    if (
      !involvesAssetInPool(pool, assetIn) ||
      currentPath.find((pathPool) => poolEquals(pool, pathPool))
    )
      continue;

    const outputToken =
      pool.assetA.assetId === assetIn.assetId ? pool.assetB : pool.assetA;
    if (outputToken.assetId === assetOut.assetId) {
      allPaths.push({
        pools: [...currentPath, pool],
        assetIn: startAssetIn,
        assetOut,
      }); // pools and tokenIn and tokenOut for each route
    } else if (maxHops > 1) {
      computeAllRoutes(
        outputToken,
        assetOut,
        pools,
        [...currentPath, pool],
        allPaths,
        startAssetIn,
        maxHops - 1,
      );
    }
  }

  return allPaths;
}

const useRoutablePools = (
  assetIn?: CoinData,
  assetOut?: CoinData,
  shouldFetchPools = false,
) => {
  const allAssetsCombination = useAllAssetsCombination(assetIn, assetOut);

  const allAssetsPairsWithPoolId: [CoinData, CoinData, PoolId, boolean][] =
    useMemo(
      () =>
        allAssetsCombination.flatMap(([assetA, assetB]) => [
          [
            assetA,
            assetB,
            buildPoolId(assetA.assetId, assetB.assetId, true),
            true, // stable pool
          ],
          [
            assetA,
            assetB,
            buildPoolId(assetA.assetId, assetB.assetId, false),
            false, // volatile pool
          ],
        ]),
      [allAssetsCombination],
    );

  const {pools, isLoading, isRefetching, refetch} = useGetPoolsWithReserve(
    allAssetsPairsWithPoolId,
    assetIn,
    assetOut,
    shouldFetchPools,
  );

  const routes = useMemo(() => {
    if (!pools || !assetIn || !assetOut) return [];

    const routes = computeAllRoutes(
      assetIn,
      assetOut,
      pools,
      [],
      [],
      assetIn,
      2,
    );

    return routes;
  }, [assetIn, assetOut, pools]);

  return {
    isRefetching,
    refetch,
    routes,
    isLoading,
  };
};

export default useRoutablePools;
