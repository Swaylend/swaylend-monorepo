import {BN, CoinQuantity} from "fuels";
import {useMemo} from "react";

const useAssetBalance = (
  balances: CoinQuantity[] | undefined,
  assetId: string | null,
) => {
  return useMemo(() => {
    if (!balances || !assetId) {
      return new BN(0);
    }

    return balances.find((b) => b.assetId === assetId)?.amount ?? new BN(0);
  }, [balances, assetId]);
};

export default useAssetBalance;
