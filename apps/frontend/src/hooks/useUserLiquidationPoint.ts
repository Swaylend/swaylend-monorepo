import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useUserCollateralUtilization } from './useUserCollateralUtilization';
import { useUserCollateralValue } from './useUserCollateralValue';

export const useUserLiquidationPoint = () => {
  const { data: collateralValue } = useUserCollateralValue();
  const { data: userCollateralUtilization } = useUserCollateralUtilization();

  const data = useMemo(() => {
    if (!collateralValue || !userCollateralUtilization) return BigNumber(0);
    return collateralValue.times(userCollateralUtilization);
  }, [collateralValue, userCollateralUtilization]);
  return { data };
};
