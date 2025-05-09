import {useQuery} from "@tanstack/react-query";
import {VerifiedAssets} from "../components/common/Swap/components/CoinListItem/checkIfCoinVerified";

export const useVerifiedAssets = () => {
  const {data: verifiedAssetData, isLoading} = useQuery({
    queryKey: ["verifiedAssets"],
    queryFn: async () => {
      const req = await fetch(
        `https://verified-assets.fuel.network/assets.json`,
      );
      const res = await req.json();
      return res as VerifiedAssets;
    },
    staleTime: Infinity,
    meta: {persist: true},
  });

  return {verifiedAssetData, isLoading};
};
