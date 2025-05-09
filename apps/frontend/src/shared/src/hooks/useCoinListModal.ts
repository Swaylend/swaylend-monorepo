import {type ChangeEvent, useMemo, useState} from "react";
import {useAssetList} from "./useAssetList";
import {useVerifiedAssets} from "./useVerifiedAssets";
import {CoinDataWithPrice} from "../utils/coinsConfig";
import {BN, CoinQuantity} from "fuels";
import {checkIfCoinVerified} from "../components/common/Swap/components/CoinListItem/checkIfCoinVerified";
import {useFetchMultiAssetImages} from "./useAssetImage";

const priorityOrder: string[] = ["ETH", "USDC", "USDT", "FUEL"];
const lowPriorityOrder: string[] = ["DUCKY"];

const useCoinListModalData = (
  balances: CoinQuantity[] | undefined,
  verifiedAssetsOnly?: boolean,
) => {
  const [value, setValue] = useState("");

  const {assets, isLoading} = useAssetList();
  console.log({assets})
  const {verifiedAssetData, isLoading: isVerifiedAssetsLoading} =
    useVerifiedAssets();

  const assetsWithOutIcon = assets
    .filter((asset) => !asset.icon)
    .map((asset) => asset.assetId);

  const {data: assetImages, isLoading: isAssetImagesLoading} =
    useFetchMultiAssetImages(assetsWithOutIcon);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const filterByVerification = (
    coin: CoinDataWithPrice,
    verifiedAssetsOnly?: boolean,
  ) => {
    return !verifiedAssetsOnly || coin.isVerified;
  };

  const filterBySearchValue = (coin: CoinDataWithPrice, value: string) => {
    const lowerCaseValue = value.toLowerCase();
    return (
      coin.name?.toLowerCase().includes(lowerCaseValue) ||
      coin.symbol?.toLowerCase().includes(lowerCaseValue) ||
      coin.assetId?.toLowerCase() === lowerCaseValue ||
      coin.l1Address?.toLowerCase() === lowerCaseValue
    );
  };

  // TODO: Pre-sort the list by priorityOrder and alphabet to avoid sorting each time and optimise this filtering
  const sortedCoinsList = useMemo(() => {
    if (isLoading || isVerifiedAssetsLoading || isAssetImagesLoading) return [];
    if (!assets?.length) return [];
    return assets
      .toSorted((firstAsset, secondAsset) => {
        const firstAssetPriority = priorityOrder.indexOf(firstAsset.symbol!);
        const secondAssetPriority = priorityOrder.indexOf(secondAsset.symbol!);
        const bothAssetsHavePriority =
          firstAssetPriority !== -1 && secondAssetPriority !== -1;
        const eitherAssetHasPriority =
          firstAssetPriority !== -1 || secondAssetPriority !== -1;

        if (bothAssetsHavePriority) {
          return firstAssetPriority - secondAssetPriority;
        } else if (eitherAssetHasPriority) {
          return firstAssetPriority !== -1 ? -1 : 1;
        }

        const firstAssetLowPriority = lowPriorityOrder.indexOf(
          firstAsset.name!,
        );
        const secondAssetLowPriority = lowPriorityOrder.indexOf(
          secondAsset.name!,
        );
        const bothAssetsHaveLowPriority =
          firstAssetLowPriority !== -1 && secondAssetLowPriority !== -1;
        const eitherAssetHasLowPriority =
          firstAssetLowPriority !== -1 || secondAssetLowPriority !== -1;

        if (bothAssetsHaveLowPriority) {
          return firstAssetLowPriority - secondAssetLowPriority;
        } else if (eitherAssetHasLowPriority) {
          return firstAssetLowPriority !== -1 ? 1 : -1;
        }

        if (balances) {
          const firstAssetBalance =
            balances.find((b) => b.assetId === firstAsset.assetId)?.amount ??
            new BN(0);
          const secondAssetBalance =
            balances.find((b) => b.assetId === secondAsset.assetId)?.amount ??
            new BN(0);
          const firstAssetDivisor = new BN(10).pow(firstAsset.decimals);
          const secondAssetDivisor = new BN(10).pow(secondAsset.decimals);
          // Dividing BN to a large value can lead to zero, we use proportion rule here: a/b = c/d => a*d = b*c
          const firstAssetBalanceMultiplied =
            firstAssetBalance.mul(secondAssetDivisor);
          const secondAssetBalanceMultiplied =
            secondAssetBalance.mul(firstAssetDivisor);

          if (!firstAssetBalanceMultiplied.eq(secondAssetBalanceMultiplied)) {
            return firstAssetBalanceMultiplied.gt(secondAssetBalanceMultiplied)
              ? -1
              : 1;
          }
        }

        if (firstAsset.name && secondAsset.name) {
          return firstAsset.name.localeCompare(secondAsset.name);
        }

        return 0;
      })
      .reduce<(CoinDataWithPrice & {userBalance: CoinQuantity | undefined})[]>(
        (acc, eachAsset) => {
          const coinBalance = balances?.find(
            (balance) => balance.assetId === eachAsset.assetId,
          );

          const isVerified =
            verifiedAssetData &&
            checkIfCoinVerified({
              symbol: eachAsset.symbol,
              assetId: eachAsset.assetId,
              verifiedAssetData,
            });

          let assetIcon = eachAsset?.icon;
          if (!assetIcon) {
            assetIcon = assetImages?.[eachAsset.assetId].image || undefined;
          }

          const updatedAsset = {
            ...eachAsset,
            isVerified,
            userBalance: coinBalance,
          };

          if (
            filterByVerification(updatedAsset, verifiedAssetsOnly) &&
            filterBySearchValue(updatedAsset, value)
          ) {
            acc.push(updatedAsset);
          }

          return acc;
        },
        [],
      );
  }, [assets, balances, value, verifiedAssetData, verifiedAssetsOnly]);
  return {
    handleFilterChange,
    isLoading: isLoading || isVerifiedAssetsLoading,
    allCoins: sortedCoinsList,
    searchValue: value,
  };
};

export default useCoinListModalData;
