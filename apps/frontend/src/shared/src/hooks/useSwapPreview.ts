import {useQuery} from "@tanstack/react-query";
import useSwapData from "@shared/src/hooks/useAssetPair/useSwapData";
import useReadonlyMira from "@shared/src/hooks/useReadonlyMira";
import {buildPoolId, PoolId, Asset} from "mira-dex-ts";
import {BASE_ASSETS, MAX_U256} from "@shared/src/utils/constants";
import {InsufficientReservesError} from "mira-dex-ts/dist/sdk/errors";
import {bn, BN} from "fuels";
import useAssetMetadata from "./useAssetMetadata";
import {CurrencyBoxMode, SwapState} from "../types/swap-types";
type Props = {
  swapState: SwapState;
  mode: CurrencyBoxMode;
};

type TradeType = "ExactInput" | "ExactOutput";

type MultihopPreviewData = {
  path: [string, string, boolean][];
  input_amount: BN;
  output_amount: BN;
};

type SwapPreviewData = {
  pools: PoolId[];
  previewAmount: BN;
};

export class NoRouteFoundError extends Error {
  constructor() {
    super("No route found");
  }
}

const useSwapPreview = ({swapState, mode}: Props) => {
  const {sellAssetId, buyAssetId} = useSwapData(swapState);
  const miraAmm = useReadonlyMira();
  const miraExists = Boolean(miraAmm);

  const sellMetadata = useAssetMetadata(sellAssetId);
  const buyMetadata = useAssetMetadata(buyAssetId);

  const amountString =
    mode === "sell" ? swapState.sell.amount : swapState.buy.amount;
  const amount = parseFloat(amountString);
  const amountValid = !isNaN(amount);
  const decimals =
    (mode === "sell" ? sellMetadata.decimals : buyMetadata.decimals) || 0;

  let normalizedAmount;

  try {
    normalizedAmount = amountValid
      ? bn.parseUnits(amountString, decimals)
      : bn(0);
  } catch (error) {
    console.error("Error parsing units:", error);
    normalizedAmount = bn(0);
  }

  const amountNonZero = normalizedAmount.gt(0);

  const tradeType: TradeType = mode === "sell" ? "ExactInput" : "ExactOutput";

  const {
    data: multihopPreviewData,
    error: multihopPreviewError,
    isLoading: multihopPreviewLoading,
    failureCount: multihopFailureCount,
    refetch,
  } = useQuery({
    queryKey: [
      "multihopPreview",
      sellAssetId,
      buyAssetId,
      normalizedAmount,
      tradeType,
    ],
    queryFn: async () => {
      const potentialRoutes: [string, string, boolean][][] = [
        [[sellAssetId, buyAssetId, false]],
        [[sellAssetId, buyAssetId, true]],
      ];

      for (const intermediateAsset of BASE_ASSETS) {
        if (
          intermediateAsset !== sellAssetId &&
          intermediateAsset !== buyAssetId
        ) {
          potentialRoutes.push([
            [sellAssetId, intermediateAsset, false],
            [intermediateAsset, buyAssetId, false],
          ]);
          potentialRoutes.push([
            [sellAssetId, intermediateAsset, true],
            [intermediateAsset, buyAssetId, false],
          ]);
          potentialRoutes.push([
            [sellAssetId, intermediateAsset, false],
            [intermediateAsset, buyAssetId, true],
          ]);
          potentialRoutes.push([
            [sellAssetId, intermediateAsset, true],
            [intermediateAsset, buyAssetId, true],
          ]);
        }
      }

      const previewData: MultihopPreviewData = {
        path: [],
        input_amount: MAX_U256,
        output_amount: bn(0),
      };

      // API is returning unreliable data, let's re-simulate
      if (tradeType === "ExactInput") {
        const previews = await Promise.all(
          potentialRoutes.map((route) =>
            miraAmm
              ?.previewSwapExactInput(
                {bits: sellAssetId},
                normalizedAmount,
                route.map(([input, output, stable]) =>
                  buildPoolId(input, output, stable),
                ),
              )
              .catch((e: any) => {
                console.error(e);
                return undefined;
              }),
          ),
        );

        previewData.input_amount = normalizedAmount;

        for (let i = 0; i < previews.length; i++) {
          const preview = previews[i];
          if (preview && previewData.output_amount.lt(preview[1])) {
            previewData.path = potentialRoutes[i];
            previewData.output_amount = preview[1];
          }
        }
      } else {
        const previews = await Promise.all(
          potentialRoutes.map((route) =>
            miraAmm
              ?.previewSwapExactOutput(
                {bits: buyAssetId},
                normalizedAmount,
                route.map(([input, output, stable]) =>
                  buildPoolId(input, output, stable),
                ),
              )
              .catch(() => undefined),
          ),
        );

        previewData.output_amount = normalizedAmount;

        for (let i = 0; i < previews.length; i++) {
          const preview = previews[i];
          if (preview && previewData.input_amount.gt(preview[1])) {
            previewData.path = potentialRoutes[i];
            previewData.input_amount = preview[1];
          }
        }
      }

      // Handle the case where input_amount is MAX_U256
      if (previewData.input_amount.eq(MAX_U256)) {
        throw new Error("Routing failed");
      }

      return previewData;
    },
    retry: (failureCount, error) => {
      if (error instanceof NoRouteFoundError) {
        return false;
      }

      return failureCount < 1;
    },
    retryDelay: 1000,
    enabled: amountNonZero && miraExists,
    refetchInterval: 15000,
  });

  const volatilePool = buildPoolId(
    {bits: sellAssetId},
    {bits: buyAssetId},
    false,
  );
  const stablePool = buildPoolId({bits: sellAssetId}, {bits: buyAssetId}, true);
  const shouldFetchFallback =
    Boolean(multihopPreviewError) &&
    multihopFailureCount === 2 &&
    miraExists &&
    amountNonZero;

  async function getFallbackPoolId(): Promise<PoolId | undefined> {
    try {
      const volatileMeta = await miraAmm
        ?.poolMetadata(volatilePool)
        .catch(() => undefined);
      const stableMeta = await miraAmm
        ?.poolMetadata(stablePool)
        .catch(() => undefined);

      if (!volatileMeta && !stableMeta) {
        return undefined;
      }

      if (!volatileMeta) return stablePool;
      if (!stableMeta) return volatilePool;

      const volatileReservesProduct = volatileMeta.reserve0.mul(
        volatileMeta.reserve1,
      );
      const stableReservesProduct = stableMeta.reserve0.mul(
        stableMeta.reserve1,
      );

      return volatileReservesProduct >= stableReservesProduct
        ? volatilePool
        : stablePool;
    } catch (error) {
      console.error("Error determining fallback pool:", error);
      return undefined;
    }
  }

  const {
    data: fallbackPreviewData,
    error: fallbackPreviewError,
    isLoading: fallbackPreviewLoading,
  } = useQuery({
    queryKey: ["fallbackPreview", sellAssetId, buyAssetId, normalizedAmount],
    queryFn: async () => {
      const fallbackPoolId = await getFallbackPoolId();

      if (!fallbackPoolId) {
        throw new NoRouteFoundError();
      }

      const fallbackPreviewResponse =
        mode === "sell"
          ? await miraAmm?.previewSwapExactInput(
              {bits: sellAssetId},
              normalizedAmount,
              [fallbackPoolId],
            )
          : await miraAmm?.previewSwapExactOutput(
              {bits: buyAssetId},
              normalizedAmount,
              [fallbackPoolId],
            );

      if (!fallbackPreviewResponse) {
        return;
      }

      return [fallbackPreviewResponse, fallbackPoolId] as [Asset, PoolId];
    },
    enabled: shouldFetchFallback,
    retry: (failureCount, error) => {
      if (
        error instanceof InsufficientReservesError ||
        error instanceof NoRouteFoundError
      ) {
        return false;
      }

      return failureCount < 1;
    },
    retryDelay: 1000,
    refetchInterval: 15000,
  });

  let previewData: SwapPreviewData | null = null;
  if (multihopPreviewData) {
    const {path, input_amount, output_amount} =
      multihopPreviewData as MultihopPreviewData;
    previewData = {
      pools: path.map(([input, output, stable]) =>
        buildPoolId(input, output, stable),
      ),
      previewAmount:
        mode === "sell"
          ? new BN(output_amount.toString())
          : new BN(input_amount.toString()),
    };
  } else if (fallbackPreviewData) {
    const [fallbackPreviewResponse, fallbackPoolId] = fallbackPreviewData;
    previewData = {
      pools: [fallbackPoolId],
      previewAmount: fallbackPreviewResponse[1],
    };
  }

  const previewError = !previewData
    ? fallbackPreviewError || multihopPreviewError
    : null;

  return {
    previewData,
    previewLoading: multihopPreviewLoading || fallbackPreviewLoading,
    previewError,
    refetchPreview: refetch,
  };
};

export default useSwapPreview;
