import { TOKENS_BY_ASSET_ID } from '@src/constants';
import type { MarketAbi } from '@src/contract-types';
import type { RootStore } from '@src/stores';
import BN from '@src/utils/BN';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useUserCollateral } from './useUserCollateral';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';

export const useCollateralUtilization = (
  marketContract: MarketAbi,
  getTokenPrice: (a: string) => any,
  rootStore: RootStore
) => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow(
    marketContract,
    rootStore.accountStore.addressInput?.value ?? ''
  );
  const { data: assetsConfigs } = useCollateralConfigurations(marketContract);
  const { data: collateralBalances, isLoading } = useUserCollateral(
    marketContract,
    rootStore.dashboardStore.collaterals,
    rootStore.accountStore.addressInput?.value ?? ''
  );

  const trueCollateralsValue = useMemo(() => {
    if (collateralBalances == null || assetsConfigs == null) return BN.ZERO;
    return Object.entries(collateralBalances!).reduce((acc, [assetId, v]) => {
      const token = TOKENS_BY_ASSET_ID[assetId];
      const liquidationFactor = BN.formatUnits(
        assetsConfigs![assetId].liquidate_collateral_factor.toString(),
        4
      );
      const balance = BN.formatUnits(v, token.decimals);
      const dollBalance = getTokenPrice(assetId).times(balance);
      const trueDollBalance = dollBalance.times(liquidationFactor);
      return acc.plus(trueDollBalance);
    }, BN.ZERO);
  }, [collateralBalances, assetsConfigs]);

  const borrowedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return BN.ZERO;
    return userSupplyBorrow[1];
  }, [userSupplyBorrow]);

  const baseTokenPrice = getTokenPrice(
    rootStore.dashboardStore.baseToken.assetId
  );
  const loanValue = BN.formatUnits(
    borrowedBalance ?? BN.ZERO,
    rootStore.dashboardStore.baseToken.decimals
  ).times(baseTokenPrice);

  const res = useMemo(() => {
    return loanValue.div(trueCollateralsValue);
  }, [loanValue, trueCollateralsValue]);
  if (res.isNaN()) return BN.ZERO;
  return res;
};
