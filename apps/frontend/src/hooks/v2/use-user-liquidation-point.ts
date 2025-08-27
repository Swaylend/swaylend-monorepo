import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useUserCollateralUtilization } from './use-user-collateral-utilization';
import { useUserCollateralValue } from './use-user-collateral-value';

export const useUserLiquidationPoint = () => {
  const { data: collateralValue } = useUserCollateralValue();
  const { data: userCollateralUtilization } = useUserCollateralUtilization();

  return useQuery({
    queryKey: [
      'userLiquidationPoint',
      'v2',
      collateralValue?.toString(),
      userCollateralUtilization?.toString(),
    ],
    queryFn: () => {
      if (!(collateralValue && userCollateralUtilization)) return BigNumber(0);
      return collateralValue.times(userCollateralUtilization);
    },
    enabled: !!collateralValue && !!userCollateralUtilization,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
