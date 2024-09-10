import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useUserCollateralUtilization } from './useUserCollateralUtilization';
import { useUserCollateralValue } from './useUserCollateralValue';

export const useUserLiquidationPoint = () => {
  const { data: collateralValue } = useUserCollateralValue();
  const { data: userCollateralUtilization } = useUserCollateralUtilization();

  return useQuery({
    queryKey: [
      'userLiquidationPoint',
      collateralValue,
      userCollateralUtilization,
    ],
    queryFn: async () => {
      if (!collateralValue || !userCollateralUtilization) return BigNumber(0);
      return collateralValue.times(userCollateralUtilization);
    },
    enabled: !!collateralValue && !!userCollateralUtilization,
  });
};
