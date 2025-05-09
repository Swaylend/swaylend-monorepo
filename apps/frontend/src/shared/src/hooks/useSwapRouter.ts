import {useQueries} from "@tanstack/react-query";
import {type BN, bn} from "fuels";
import {CoinData} from "../utils/coinsConfig";
import useReadonlyMira from "./useReadonlyMira";
import useRoutablePools from "./useRoutablePools";
import {useMemo} from "react";
import {Route} from "./useGetPoolsWithReserve";
import type {ReadonlyMiraAmm} from "mira-dex-ts";

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  REEFETCHING,
}

export enum TradeType {
  EXACT_IN = "EXACT_IN",
  EXACT_OUT = "EXACT_OUT",
}

type OptimialTrade = {
  bestRoute: null | Route;
  amountIn: null | BN;
  amountOut: null | BN;
};

type SwapPreviewState = {
  tradeState: TradeState;
  trade: OptimialTrade | undefined;
  error: string | null;
};

const getSwapQuotes = (
  inputAmount: BN,
  tradeType: TradeType,
  route: Route,
  miraAmm: ReadonlyMiraAmm,
) => {
  if (tradeType === TradeType.EXACT_IN)
    return miraAmm.previewSwapExactInput(
      {
        bits: route.assetIn.assetId,
      },
      inputAmount,
      route.pools.map((pool) => pool.poolId),
    );

  // exact out
  return miraAmm.previewSwapExactOutput(
    {
      bits: route.assetOut.assetId,
    },
    inputAmount,
    route.pools.map((pool) => pool.poolId),
  );
};

const useSwapRouter = (
  tradeType: TradeType,
  amountSpecified: BN = bn(0),
  assetIn?: CoinData,
  assetOut?: CoinData,
): SwapPreviewState => {
  const miraAmm = useReadonlyMira();

  const shouldFetchPools = !!assetIn && !!assetOut && amountSpecified.gt(0);

  const {
    isLoading: isRoutesLoading,
    routes,
    isRefetching: isRoutesRefetching,
    // refetch: refetchRoute,
  } = useRoutablePools(assetIn, assetOut, shouldFetchPools);

  const {
    data: quoteResults,
    isLoading,
    isRefetching,
  } = useQueries({
    queries:
      routes.length && miraAmm && shouldFetchPools
        ? routes.map((route) => ({
            queryFn: () =>
              getSwapQuotes(amountSpecified, tradeType, route, miraAmm),
            queryKey: [
              "swap-route-quote",
              route,
              tradeType,
              amountSpecified.toString(),
              assetIn.assetId,
              assetOut.assetId,
            ],
          }))
        : [],
    combine: (results) => ({
      isRefetching: results.some((result) => result.isRefetching),
      data: results.map((result, idx) =>
        result.data
          ? {
              amountOut: result.data[1],
              route: routes[idx],
            }
          : undefined,
      ),
      pending: results.some((result) => result.isPending),
      isLoading: results.some((result) => result.isLoading),
      isSuccess: results.every((result) => result.isSuccess),
    }),
  });

  // find the best route out of all routes
  return useMemo(() => {
    if (isLoading || isRoutesLoading)
      return {
        tradeState: TradeState.LOADING,
        trade: undefined,
        error: null,
      };

    if (!assetIn || !assetOut)
      return {
        tradeState: TradeState.INVALID,
        trade: undefined,
        error: null,
      };

    // This can also happen when query throws an error
    if (!quoteResults.length)
      return {
        tradeState: TradeState.NO_ROUTE_FOUND,
        trade: undefined,
        error: amountSpecified.gt(0) ? "No route found for this trade" : null,
      };

    const {bestRoute, amountIn, amountOut} = quoteResults.reduce<{
      bestRoute: null | Route;
      amountIn: null | BN;
      amountOut: null | BN;
    }>(
      (currentBest, quote) => {
        if (!quote) return currentBest;
        if (tradeType === TradeType.EXACT_IN) {
          if (
            currentBest.amountOut === null ||
            currentBest.amountOut.lt(quote.amountOut)
          )
            return {
              bestRoute: quote.route,
              amountIn: amountSpecified,
              amountOut: quote.amountOut,
            };
        } else {
          if (
            currentBest.amountIn === null ||
            currentBest.amountIn.gt(quote.amountOut)
          ) {
            return {
              bestRoute: quote.route,
              amountIn: quote.amountOut,
              amountOut: amountSpecified,
            };
          }
        }
        return currentBest;
      },
      {
        bestRoute: null,
        amountIn: null,
        amountOut: null,
      },
    );

    // Situation of no liquidity
    if (!bestRoute || !amountIn || !amountOut)
      return {
        tradeState: TradeState.INVALID,
        trade: undefined,
        error: "Insufficient reserves in pool",
      };

    // When refetching, return the previous route
    if (isRefetching || isRoutesRefetching)
      return {
        tradeState: TradeState.REEFETCHING,
        trade: {
          bestRoute,
          amountIn,
          amountOut,
        },
        error: null,
      };

    return {
      tradeState: TradeState.VALID,
      trade: {
        bestRoute,
        amountIn,
        amountOut,
      },
      error: null,
    };
  }, [
    isLoading,
    isRoutesLoading,
    assetIn,
    assetOut,
    quoteResults,
    isRefetching,
    isRoutesRefetching,
    tradeType,
    amountSpecified,
  ]);
};

export default useSwapRouter;
