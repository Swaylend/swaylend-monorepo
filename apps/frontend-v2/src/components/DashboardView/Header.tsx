import { GetCollateralAssetsQuery } from '@/__generated__/swaylend/graphql';
import { useBorrowRate, useSupplyRate, useUserSupplyBorrow } from '@/hooks';
import { usePrice } from '@/hooks/usePrice';
import { useUserCollateralAssets } from '@/hooks/useUserCollateralAssets';
import { getCollateralAssets } from '@/lib/queries/getCollateralAssets';
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from '@/utils';
import { formatUnits } from '@/utils/BigNumber';
import {
  getBorrowApr,
  getSupplyApr,
  getTotalSuppliedBalance,
} from '@/utils/market';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

export const Header = () => {
  const { data: borrowRate } = useBorrowRate();
  const { data: supplyRate } = useSupplyRate();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePrice(TOKENS_LIST.map((i) => i.assetId));

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
      priceData ?? {}
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
