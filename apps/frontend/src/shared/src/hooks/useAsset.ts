import {CoinData} from "../utils/coinsConfig";
import useAssetMetadata from "./useAssetMetadata";

/**
 * This hook is just a wrapper for useAssestMetadata to return asset as Coindata type.
 * TODO: Update useAssetMetadata to return assets as CoinData type and deprecate this hook
 */
const useAsset = (
  assetId: string,
): {isLoading: boolean; asset: CoinData | undefined} => {
  const {isLoading, decimals, name, symbol} = useAssetMetadata(assetId);

  const asset: CoinData | undefined =
    decimals && name && symbol ? {decimals, name, symbol, assetId} : undefined;
  return {
    isLoading,
    asset,
  };
};

export default useAsset;
