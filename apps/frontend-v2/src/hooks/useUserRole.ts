import { useIsConnected } from '@fuels/react';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';

export enum USER_ROLE {
  LENDER = 'LENDER',
  BORROWER = 'BORROWER',
  NONE = 'NONE',
}

export const useUserRole = () => {
  const { isConnected } = useIsConnected();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  if (!isConnected) {
    return USER_ROLE.NONE;
  }

  // FIXME: A better way to select this (or maybe just adjust the value)
  if (userSupplyBorrow?.supplied.gt(10)) {
    return USER_ROLE.LENDER;
  }
  if (userSupplyBorrow?.borrowed.gt(0)) {
    return USER_ROLE.BORROWER;
  }

  return USER_ROLE.NONE;
};
