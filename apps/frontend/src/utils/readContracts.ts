import { PYTH_CONTRACT_ABI } from '@pythnetwork/pyth-fuel-js';
import type { IContractsConfig } from '@src/constants';
import { MarketAbi__factory } from '@src/contract-types';
import { Contract, type Provider, type WalletUnlocked } from 'fuels';

export const getMarketContract = (
  wallet: WalletUnlocked,
  currentVersionConfig: IContractsConfig
) => {
  const { market } = currentVersionConfig;
  return MarketAbi__factory.connect(market, wallet!);
};

export const getOracleContract = (
  wallet: WalletUnlocked,
  provider: Provider,
  currentVersionConfig: IContractsConfig
) => {
  const { priceOracle } = currentVersionConfig;
  return new Contract(priceOracle, PYTH_CONTRACT_ABI, provider);
};
