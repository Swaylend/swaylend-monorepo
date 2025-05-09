import {useQuery} from "@tanstack/react-query";
import {ZeroBytes32} from "fuels";
import {BASE_ASSET_CONTRACT, ETH_ASSET_ID} from "../utils/constants";
import {useAssetList} from "./useAssetList";

export const useAssetMinterContract = (
  assetId: string | null,
): {contractId: string | null; subId: string | null; isLoading: boolean} => {
  const {assets, isLoading: assetListLoading} = useAssetList();

  if (assetId && assetId.length !== 66) {
    throw new Error("Invalid assetId");
  }

  const {data, isLoading} = useQuery({
    queryKey: ["assetMinter", assetId],
    queryFn: async () => {
      if (assetId === ETH_ASSET_ID) {
        return {
          contractId: BASE_ASSET_CONTRACT,
          subId: ZeroBytes32,
        };
      }

      for (const asset of assets) {
        if (asset.assetId === assetId) {
          return {
            contractId: asset.contractId!,
            subId: asset.subId!,
          };
        }
      }

      const req = await fetch(
        `https://mainnet-explorer.fuel.network/assets/${assetId}`,
      );
      const res = await req.json();

      return res as {contractId: string; subId: string};
    },
    enabled: assetId !== null && !assetListLoading,
    staleTime: Infinity,
  });

  return data
    ? {...data, isLoading}
    : {contractId: null, subId: null, isLoading};
};
