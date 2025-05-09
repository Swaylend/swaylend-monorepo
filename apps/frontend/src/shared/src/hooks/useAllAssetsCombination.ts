import {useMemo} from "react";
import {BASE_ASSETS, CoinData} from "../utils/coinsConfig";

export const useAllAssetsCombination = (
  assetA?: CoinData,
  assetB?: CoinData,
): [CoinData, CoinData][] => {
  const basePairs: [CoinData, CoinData][] = BASE_ASSETS.flatMap(
    (base): [CoinData, CoinData][] =>
      BASE_ASSETS.map((otherBase) => [base, otherBase]),
  ).filter(([a0, a1]) => a0.assetId !== a1.assetId);

  return useMemo(
    () =>
      assetA && assetB
        ? [
            // the direct pair
            [assetA, assetB] as [CoinData, CoinData],
            // token A against all bases
            ...BASE_ASSETS.map((base): [CoinData, CoinData] => [assetA, base]),
            // token B against all bases
            ...BASE_ASSETS.map((base): [CoinData, CoinData] => [assetB, base]),
            // each base against all bases
            ...basePairs,
          ]
            // filter out invalid pairs comprised of the same asset
            .filter(([t0, t1]) => t0.assetId !== t1.assetId)
            // filter out duplicate pairs
            .filter(([t0, t1], i, otherPairs) => {
              // find the first index in the array at which there are the same 2 tokens as the current
              const firstIndexInOtherPairs = otherPairs.findIndex(
                ([t0Other, t1Other]) => {
                  return (
                    (t0.assetId === t0Other.assetId &&
                      t1.assetId === t1Other.assetId) ||
                    (t0.assetId === t1Other.assetId &&
                      t1.assetId === t0Other.assetId)
                  );
                },
              );
              // only accept the first occurrence of the same 2 tokens
              return firstIndexInOtherPairs === i;
            })
        : [],
    [assetA, assetB, basePairs],
  );
};
