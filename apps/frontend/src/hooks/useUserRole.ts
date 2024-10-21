import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';

export enum USER_ROLE {
  LENDER = 'LENDER',
  BORROWER = 'BORROWER',
  NONE = 'NONE',
}

export const useUserRole = () => {
  const { isConnected } = useIsConnected();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();

  if (!isConnected || !userSupplyBorrow || !marketConfiguration) {
    return USER_ROLE.NONE;
  }

  const supplyTreshold = BigNumber(0.1).times(
    BigNumber(10).pow(marketConfiguration.baseTokenDecimals)
  );

  const borrowTreshold = BigNumber(0.1).times(
    BigNumber(10).pow(marketConfiguration.baseTokenDecimals)
  );

  if (userSupplyBorrow.supplied.gt(supplyTreshold)) {
    return USER_ROLE.LENDER;
  }

  if (userSupplyBorrow.borrowed.gt(borrowTreshold)) {
    return USER_ROLE.BORROWER;
  }

  return USER_ROLE.NONE;
};
