import { useUserCollateralUtilization } from './useUserCollateralUtilization';
import { useUserCollateralValue } from './useUserCollateralValue';
import BigNumber from 'bignumber.js';
import { useQuery } from '@tanstack/react-query';

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
