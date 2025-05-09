"use client";
import CoinListItem from "@shared/src/components/common/Swap/components/CoinListItem/CoinListItem";
import SearchIcon from "@shared/src/components/icons/Search/SearchIcon";
import useCoinListModalData from "@shared/src/hooks/useCoinListModal";
import {CoinQuantity} from "fuels";
import {memo, useEffect, useRef} from "react";
import EmptySearchResults from "../EmptySearchResults";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader";
import UnknownCoinListItem from "../UnknownCoinListItem";
import styles from "./CoinsListModal.module.css";

type Props = {
  balances: CoinQuantity[] | undefined;
  selectCoin: (assetId: string | null) => void;
  verifiedAssetsOnly?: boolean;
};

const assetIdRegex = /^0x[0-9a-fA-F]{64}$/;

const CoinsListModal = ({selectCoin, verifiedAssetsOnly, balances}: Props) => {
  const {allCoins, handleFilterChange, isLoading, searchValue} =
    useCoinListModalData(balances, verifiedAssetsOnly);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <div className={styles.tokenSearch}>
        <SearchIcon />
        <input
          className={styles.tokenSearchInput}
          type="text"
          placeholder="Search by token or paste address"
          onChange={handleFilterChange}
          ref={inputRef}
        />
      </div>
      <SkeletonLoader isLoading={isLoading} count={8} textLines={2}>
        <div className={styles.tokenList}>
          {!allCoins?.length && !!searchValue && (
            <>
              {assetIdRegex.test(searchValue) ? (
                <UnknownCoinListItem
                  assetId={searchValue}
                  balance={balances?.find((b) => b.assetId === searchValue)}
                  onClick={() => selectCoin(searchValue)}
                />
              ) : (
                <EmptySearchResults value={searchValue} />
              )}
            </>
          )}
          {allCoins.map((asset) => (
            <div
              className={styles.tokenListItem}
              onClick={() => selectCoin(asset.assetId)}
              key={asset.assetId}
            >
              <CoinListItem assetData={asset} />
            </div>
          ))}
        </div>
      </SkeletonLoader>
    </>
  );
};

export default memo(CoinsListModal);
