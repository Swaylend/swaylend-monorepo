import {useMemo} from "react";

import {DefaultLocale} from "@shared/src/utils/constants";
import useAssetMetadata from "../useAssetMetadata";

type Props = {
  firstAssetId: string | null;
  secondAssetId: string | null;
  firstAssetAmount: string;
  secondAssetAmount: string;
  baseAssetId: string | null;
};

const useExchangeRateV2 = ({
  firstAssetId,
  secondAssetId,
  firstAssetAmount,
  secondAssetAmount,
  baseAssetId,
}: Props): string | null => {
  const firstAssetMetadata = useAssetMetadata(firstAssetId);
  const secondAssetMetadata = useAssetMetadata(secondAssetId);

  return useMemo(() => {
    const showRate =
      firstAssetId !== null &&
      secondAssetId !== null &&
      firstAssetAmount !== "" &&
      secondAssetAmount !== "";
    if (!showRate) {
      return null;
    }

    const firstAssetIsBase = baseAssetId === firstAssetId;

    const activeModeAmountValue = parseFloat(
      firstAssetIsBase ? firstAssetAmount : secondAssetAmount,
    );
    if (activeModeAmountValue === 0) {
      return null;
    }

    const anotherAssetDecimals = firstAssetIsBase
      ? secondAssetMetadata.decimals
      : firstAssetMetadata.decimals;

    const assetNameToUseForBase = firstAssetIsBase
      ? firstAssetMetadata.symbol
      : secondAssetMetadata.symbol;
    const assetNameToUseForAnother = firstAssetIsBase
      ? secondAssetMetadata.symbol
      : firstAssetMetadata.symbol;

    const rate =
      parseFloat(firstAssetIsBase ? secondAssetAmount : firstAssetAmount) /
      parseFloat(firstAssetIsBase ? firstAssetAmount : secondAssetAmount);
    return `1 ${assetNameToUseForBase} ≈ ${rate.toLocaleString(DefaultLocale, {maximumFractionDigits: anotherAssetDecimals})} ${assetNameToUseForAnother}`;
  }, [
    baseAssetId,
    firstAssetAmount,
    firstAssetId,
    secondAssetAmount,
    secondAssetId,
  ]);
};

export default useExchangeRateV2;
