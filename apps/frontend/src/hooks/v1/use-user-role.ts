import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useMarketConfiguration } from './use-market-configuration';
import { usePrice } from './use-price';
import { useUserSupplyBorrow } from './use-user-supply-borrow';

export enum USER_ROLE {
  LENDER = 'LENDER',
  BORROWER = 'BORROWER',
  NONE = 'NONE',
}

export const useUserRole = () => {
  const { isConnected } = useIsConnected();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: priceData } = usePrice();

  return useMemo(() => {
    if (
      !isConnected ||
      !userSupplyBorrow ||
      !marketConfiguration ||
      !priceData
    ) {
      return USER_ROLE.NONE;
    }

    // Supply treshold is $0.1
    const supplyTreshold = BigNumber(0.1).dividedBy(
      priceData.prices[marketConfiguration.baseToken.bits] ?? 1
    );

    // Borrow treshold is $10
    const borrowTreshold = BigNumber(0.1).dividedBy(
      priceData.prices[marketConfiguration.baseToken.bits] ?? 1
    );

    const userSuppliedUsd = userSupplyBorrow.supplied
      .times(priceData.prices[marketConfiguration.baseToken.bits] ?? 1)
      .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

    const userBorrowedUsd = userSupplyBorrow.borrowed
      .times(priceData.prices[marketConfiguration.baseToken.bits] ?? 1)
      .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

    if (userSuppliedUsd.gte(supplyTreshold)) {
      return USER_ROLE.LENDER;
    }

    if (userBorrowedUsd.gte(borrowTreshold)) {
      return USER_ROLE.BORROWER;
    }

    return USER_ROLE.NONE;
  }, [isConnected, userSupplyBorrow, marketConfiguration, priceData]);
};
