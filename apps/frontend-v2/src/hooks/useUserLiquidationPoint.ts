import { useMemo } from 'react';
import { useUserCollateralValue } from './useUserCollateralValue';
import { useUserCollateralUtilization } from './useUserCollateralUtilization';

export const useUserLiquidationPoint = () => {
  const collateralValue = useUserCollateralValue();
  const userCollateralUtilization = useUserCollateralUtilization();

  const userLiquidationPoint = useMemo(() => {
    return collateralValue.times(userCollateralUtilization);
  }, [collateralValue, userCollateralUtilization]);
  return userLiquidationPoint;
};
