import {
  useBorrowCapacity,
  useBorrowRate,
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useSupplyRate,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks';

import { formatUnits, getBorrowApr, getSupplyApr } from '@/utils';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

export const Header = () => {
  const { data: borrowRate } = useBorrowRate();
  const { data: supplyRate } = useSupplyRate();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: colateralConfigurations } = useCollateralConfigurations();
  const { data: borrowCapacity } = useBorrowCapacity();

  const totalSuppliedBalance = useMemo(() => {
    if (
      !marketConfiguration ||
      !userSupplyBorrow ||
      !priceData ||
      !userCollateralAssets ||
      !colateralConfigurations
    ) {
      return BigNumber(0).toFormat(2);
    }

    const baseTokenSupliedBalance = formatUnits(
      userSupplyBorrow.supplied.times(
        priceData.prices[marketConfiguration.baseToken]
      ),
      marketConfiguration.baseTokenDecimals
    );

    const collateralSuppiedBalance = Object.entries(
      userCollateralAssets
    ).reduce((acc, [key, value]) => {
      return acc.plus(
        formatUnits(
          value.times(priceData.prices[key]),
          colateralConfigurations[key].decimals
        )
      );
    }, new BigNumber(0));

    return baseTokenSupliedBalance.plus(collateralSuppiedBalance).toFormat(2);
  }, [
    userSupplyBorrow,
    userCollateralAssets,
    priceData,
    marketConfiguration,
    colateralConfigurations,
  ]);

  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);

  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  if (!marketConfiguration) return <div>Loading...</div>;

  return (
    <div className="flex justify-between w-full">
      <div>Supplied Balance: {totalSuppliedBalance}$</div>
      <div>
        Supply{supplyApr}/borrow APR{borrowApr}
      </div>
      <div>
        Borrowed balance:{' '}
        {formatUnits(
          userSupplyBorrow?.borrowed ?? new BigNumber(0),
          marketConfiguration.baseTokenDecimals
        ).toFormat(2)}
        $
      </div>
      <div>Borrow capacity: {borrowCapacity?.toFormat(2)}</div>
    </div>
  );
};
