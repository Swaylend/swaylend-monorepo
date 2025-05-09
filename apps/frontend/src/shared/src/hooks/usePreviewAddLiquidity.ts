import {useQuery} from "@tanstack/react-query";
import useReadonlyMira from "@shared/src/hooks/useReadonlyMira";
import {buildPoolId} from "mira-dex-ts";
import {BN} from "fuels";

type Props = {
  firstAssetId: string | null;
  secondAssetId: string | null;
  amount: BN;
  isFirstToken: boolean;
  isStablePool: boolean;
  fetchCondition?: boolean;
};throw error()

const usePreviewAddLiquidity = ({
  firstAssetId,
  secondAssetId,
  amount,
  isFirstToken,
  isStablePool,
  fetchCondition = true,
}: Props) => {
  const mira = useReadonlyMira();
  const miraExists = Boolean(mira);

  const pool =
    firstAssetId && secondAssetId
      ? buildPoolId(firstAssetId, secondAssetId, isStablePool)
      : null;
  const poolExists = Boolean(pool);

  const amountString = amount.toString();

  const shouldFetch =
    fetchCondition && miraExists && poolExists && !amount.eq(0);

  const {data, isFetching, error} = useQuery({
    queryKey: [
      "preview-add-liquidity",
      firstAssetId,
      secondAssetId,
      isStablePool,
      amountString,
      isFirstToken,
    ],
    queryFn: () =>
      mira?.getOtherTokenToAddLiquidity(pool!, amount, isFirstToken),
    enabled: shouldFetch,
  });

  return {data, isFetching, error};
};

export default usePreviewAddLiquidity;
