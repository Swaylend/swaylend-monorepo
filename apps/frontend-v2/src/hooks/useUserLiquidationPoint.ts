import { useMemo } from 'react';
import { useUserCollateralUtilization } from './useUserCollateralUtilization';
import { useUserCollateralValue } from './useUserCollateralValue';

export const useUserLiquidationPoint = () => {
  const collateralValue = useUserCollateralValue();
  const userCollateralUtilization = useUserCollateralUtilization();

  const userLiquidationPoint = useMemo(() => {
    return collateralValue.times(userCollateralUtilization);
  }, [collateralValue, userCollateralUtilization]);
  return userLiquidationPoint;
};
