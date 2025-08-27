import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { createStableHash } from '@/utils';
import { usePriceData } from './oracles';
import { useMarketConfiguration } from './use-market-configuration';
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
  const { data: priceData } = usePriceData();

  return useMemo(() => {
    if (
      !(isConnected && userSupplyBorrow && marketConfiguration && priceData)
    ) {
      return USER_ROLE.NONE;
    }

    const baseTokenPrice = priceData?.prices.get(
      marketConfiguration.baseToken.bits
    )?.[0]?.price;

    if (!baseTokenPrice) {
      // TODO[v2]: Verify this doesn't cause any issues.
      return USER_ROLE.NONE;
    }

    // Supply treshold is $0.1
    const supplyTreshold = BigNumber(0.1).dividedBy(baseTokenPrice);

    // Borrow treshold is $10
    const borrowTreshold = BigNumber(0.1).dividedBy(baseTokenPrice);

    const userSuppliedUsd = userSupplyBorrow.supplied
      .times(baseTokenPrice)
      .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

    const userBorrowedUsd = userSupplyBorrow.borrowed
      .times(baseTokenPrice)
      .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

    if (userSuppliedUsd.gte(supplyTreshold)) {
      return USER_ROLE.LENDER;
    }

    if (userBorrowedUsd.gte(borrowTreshold)) {
      return USER_ROLE.BORROWER;
    }

    return USER_ROLE.NONE;
  }, [
    isConnected,
    userSupplyBorrow,
    createStableHash(marketConfiguration),
    priceData?.timestamp,
  ]);
};
