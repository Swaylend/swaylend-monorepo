import useReadonlyMira from "@shared/src/hooks/useReadonlyMira";
import {PoolId} from "mira-dex-ts";
import {useQuery} from "@tanstack/react-query";
import {B256Address} from "fuels";
import useAssetMetadata from "./useAssetMetadata";

type Props = {
  pools: PoolId[] | undefined;
  sellAssetId: B256Address | null;
  buyAssetId: B256Address | null;
};

const useReservesPrice = ({pools, sellAssetId, buyAssetId}: Props) => {
  const miraAmm = useReadonlyMira();

  const sellMetadata = useAssetMetadata(sellAssetId);
  const buyMetadata = useAssetMetadata(buyAssetId);

  const shouldFetch =
    Boolean(pools) && Boolean(miraAmm) && Boolean(sellAssetId);

  const {data} = useQuery({
    queryKey: ["reservesPrice", sellAssetId, buyAssetId, pools],
    queryFn: async () => {
      const assetInputAmount = 1000;
      const [outputAsset, previewPrice] = await miraAmm!.previewSwapExactInput(
        {bits: sellAssetId!},
        assetInputAmount,
        pools!,
      );
      return (
        ((previewPrice.toNumber() / assetInputAmount) *
          10 ** (sellMetadata.decimals ?? 0)) /
        10 ** (buyMetadata.decimals ?? 0)
      );
    },
    enabled: !!pools && !!miraAmm && !!sellMetadata && !!buyMetadata,
  });

  return {reservesPrice: data};
};

export default useReservesPrice;
