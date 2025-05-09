import {useQuery} from "@tanstack/react-query";
import {useAssetMinterContract} from "./useAssetMinterContract";
import {FuelAssetPriceUrl} from "../utils/constants";

const ETH_ASSET_ID =
  "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";
const NATIVE_BRIDGE_MINTER_CONTRACT =
  "0x4ea6ccef1215d9479f1024dff70fc055ca538215d2c8c348beddffd54583d0e8";

export const useAssetPrice = (
  assetId: string | null,
): {price: number | null; isLoading: boolean} => {
  const {contractId} = useAssetMinterContract(assetId);

  const {data, isLoading} = useQuery({
    queryKey: ["assetPrice", assetId],
    queryFn: async () => {
      const req = await fetch(`${FuelAssetPriceUrl}/${assetId}`);
      const res = await req.json();

      return res.rate || null;
    },
    enabled:
      !!assetId &&
      (contractId === NATIVE_BRIDGE_MINTER_CONTRACT ||
        assetId === ETH_ASSET_ID),
    staleTime: Infinity,
  });

  return {price: data || null, isLoading};
};
