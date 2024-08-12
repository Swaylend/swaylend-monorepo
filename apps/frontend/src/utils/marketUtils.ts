import type { MarketAbi } from '@src/contract-types';
import { PYTH_CONTRACT_ABI } from '@pythnetwork/pyth-fuel-js';
import type { AccountStore, DashboardStore, SettingsStore } from '@src/stores';
import { Contract } from 'fuels';
import type BN from './BN';

export const supplyBase = async (
  market: MarketAbi,
  dashboardStore: DashboardStore
) => {
  if (dashboardStore.tokenAmount == null || dashboardStore.tokenAmount.lte(0))
    return;
  return market.functions
    .supply_base()
    .callParams({
      forward: {
        amount: dashboardStore.tokenAmount.toString(),
        assetId: dashboardStore.baseToken.assetId,
      },
    })
    .call();
};
export const withdrawBase = async (
  market: any,
  dashboardStore: DashboardStore
) => {
  if (dashboardStore.tokenAmount == null || dashboardStore.tokenAmount.lte(0))
    return;

  return market.functions
    .withdraw_base(dashboardStore.tokenAmount.toString())
    .call();
};

export const supplyCollateral = async (
  market: MarketAbi,
  dashboardStore: DashboardStore
) => {
  if (
    dashboardStore.tokenAmount == null ||
    dashboardStore.actionTokenAssetId == null ||
    dashboardStore.tokenAmount.eq(0)
  )
    return;

  return market.functions
    .supply_collateral()
    .callParams({
      forward: {
        assetId: dashboardStore.actionTokenAssetId,
        amount: dashboardStore.tokenAmount.toString(),
      },
    })
    .call();
};

export const withdrawCollateral = async (
  market: MarketAbi,
  dashboardStore: DashboardStore,
  settingsStore: SettingsStore,
  accountStore: AccountStore
) => {
  if (
    dashboardStore.tokenAmount == null ||
    dashboardStore.actionTokenAssetId == null ||
    dashboardStore.tokenAmount.lte(0)
  )
    return;
  const { priceOracle } = settingsStore.currentVersionConfig;
  if (accountStore.provider == null) return;
  const oracle = new Contract(
    priceOracle,
    PYTH_CONTRACT_ABI,
    accountStore.provider
  );

  return market.functions
    .withdraw_collateral(
      dashboardStore.actionTokenAssetId,
      dashboardStore.tokenAmount.toString()
    )
    .addContracts([oracle])
    .call();
};

export const borrowBase = async (
  market: MarketAbi,
  dashboardStore: DashboardStore,
  availableToBorrow: BN | null,
  settingsStore: SettingsStore,
  accountStore: AccountStore
) => {
  if (
    dashboardStore.tokenAmount == null ||
    availableToBorrow == null ||
    dashboardStore.tokenAmount.lte(0)
  )
    return;
  const { priceOracle } = settingsStore.currentVersionConfig;
  if (accountStore.provider == null) return;
  const oracle = new Contract(
    priceOracle,
    PYTH_CONTRACT_ABI,
    accountStore.provider
  );
  return market.functions
    .withdraw_base(dashboardStore.tokenAmount.toFixed(0))
    .addContracts([oracle])
    .call();
};
