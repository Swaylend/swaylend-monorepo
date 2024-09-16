import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { useMarketBasics } from './useMarketBasics';
import { useMarketConfiguration } from './useMarketConfiguration';

export const useMarketBalanceOfBase = () => {
  const { data: marketBasics } = useMarketBasics();
  const { data: marketConfiguration } = useMarketConfiguration();

  if (
    !marketBasics ||
    !marketBasics.total_borrow_base ||
    !marketBasics.total_supply_base ||
    !marketConfiguration
  )
    return {
      raw: BigNumber(0),
      formatted: BigNumber(0),
    };

  const balanceOfBase = BigNumber(
    marketBasics.total_supply_base.toString()
  ).minus(BigNumber(marketBasics.total_borrow_base.toString()));

  return {
    raw: balanceOfBase,
    formatted: formatUnits(
      balanceOfBase,
      marketConfiguration.baseTokenDecimals
    ),
  };
};
