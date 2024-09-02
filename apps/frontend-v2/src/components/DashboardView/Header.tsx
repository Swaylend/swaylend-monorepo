import { useBorrowRate, useSupplyRate, useUserSupplyBorrow } from '@/hooks';
import { usePrice } from '@/hooks';
import { useUserCollateralAssets } from '@/hooks';
import {
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
  formatUnits,
  getBorrowApr,
  getSupplyApr,
  getTotalSuppliedBalance,
} from '@/utils';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

export const Header = () => {
  const { data: borrowRate } = useBorrowRate();
  const { data: supplyRate } = useSupplyRate();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePrice(TOKENS_LIST.map((i) => i.assetId));

  // TODO[Martin]: Later implement this using loading and error states.
  const borrowedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return new BigNumber(0);
    return userSupplyBorrow[1];
  }, [userSupplyBorrow]);
  const suppliedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return new BigNumber(0);
    return userSupplyBorrow[0];
  }, [userSupplyBorrow]);

  const totalSuppliedBalance = useMemo(() => {
    return getTotalSuppliedBalance(
      suppliedBalance,
      userCollateralAssets ?? {},
      priceData?.prices ?? {}
    );
  }, [userSupplyBorrow, userCollateralAssets, priceData]);

  const borrowed = formatUnits(
    borrowedBalance ?? new BigNumber(0),
    TOKENS_BY_SYMBOL.USDC.decimals
  ).toFormat(2);

  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);

  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  return (
    <div className="flex justify-between">
      <div>Supplied Balance: {totalSuppliedBalance}$</div>
      <div>
        Supply{supplyApr}/borrow APR{borrowApr}
      </div>
      <div>Borrowed balance: {borrowed}$</div>
    </div>
  );
};
