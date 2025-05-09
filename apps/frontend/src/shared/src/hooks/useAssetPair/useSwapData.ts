import {useMemo} from "react";
import {AssetIdInput} from "mira-dex-ts/dist/sdk/typegen/MiraAmmContract";

import useAssetMetadata from "../useAssetMetadata";
import {SwapState} from "../../types/swap-types";

type SwapData = {
  sellAssetId: string;
  buyAssetId: string;
  sellDecimals: number;
  buyDecimals: number;
  sellAssetIdInput: AssetIdInput;
  buyAssetIdInput: AssetIdInput;
};

const useSwapData = (swapState: SwapState): SwapData => {
  const sellMetadata = useAssetMetadata(swapState.sell.assetId);
  const buyMetadata = useAssetMetadata(swapState.buy.assetId);

  return useMemo(() => {
    const sellAssetIdInput: AssetIdInput = {
      bits: swapState.sell.assetId!,
    };
    const buyAssetIdInput: AssetIdInput = {
      bits: swapState.buy.assetId!,
    };

    return {
      sellAssetId: swapState.sell.assetId!,
      buyAssetId: swapState.buy.assetId!,
      sellDecimals: sellMetadata?.decimals || 0,
      buyDecimals: buyMetadata?.decimals || 0,
      sellAssetIdInput,
      buyAssetIdInput,
    };
  }, [swapState, sellMetadata, buyMetadata]);
};

export default useSwapData;
