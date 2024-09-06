import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks';

import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { InfoBowl } from './InfoBowl';

export const Stats = () => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: colateralConfigurations } = useCollateralConfigurations();

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

  if (!marketConfiguration) return <div>Loading...</div>;

  return (
    <div className="w-full px-[203px]">
      <div className="flex w-full bg-gradient-to-r justify-between from-background to-background via-accent items-center h-[123px] px-[56px]">
        <div className="w-[300px]">
          <div className="text-neutral3 text-lg font-semibold">
            Supplied Balance
          </div>
          <div className="text-neutral2 font-bold text-4xl">
            {totalSuppliedBalance}
          </div>
        </div>
        <InfoBowl />
        <div className="w-[300px] text-right">
          <div className="text-neutral3 text-lg font-semibold">
            Borrowed Assets
          </div>
          <div className="text-neutral2 font-bold text-4xl">
            $
            {formatUnits(
              userSupplyBorrow?.borrowed ?? new BigNumber(0),
              marketConfiguration.baseTokenDecimals
            ).toFormat(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
