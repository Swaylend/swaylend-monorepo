import { useBorrowRate, useSupplyRate, useUserSupplyBorrow } from '@/hooks';
import { usePrice } from '@/hooks';
import { useUserCollateralAssets } from '@/hooks';
import { useMarketConfiguration } from '@/hooks/useMarketConfiguration';
import {
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
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();

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
    if (!marketConfiguration) return '0';

    return getTotalSuppliedBalance(
      marketConfiguration.baseToken,
      marketConfiguration.baseTokenDecimals,
      suppliedBalance,
      userCollateralAssets ?? {},
      priceData?.prices ?? {}
    );
  }, [userSupplyBorrow, userCollateralAssets, priceData, marketConfiguration]);

  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);

  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  if (!marketConfiguration) return <div>Loading...</div>;

  return (
    <div className="flex justify-between">
      <div>Supplied Balance: {totalSuppliedBalance}$</div>
      <div>
        Supply{supplyApr}/borrow APR{borrowApr}
      </div>
      <div>
        Borrowed balance:{' '}
        {formatUnits(
          borrowedBalance ?? new BigNumber(0),
          marketConfiguration.baseTokenDecimals
        ).toFormat(2)}
        $
      </div>
    </div>
  );
};
