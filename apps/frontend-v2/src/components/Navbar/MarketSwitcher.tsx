'use client';
import { useMarketStore } from '@/stores';
import { DeployedMarket } from '@/utils';
import { Button } from '../ui/button';

export const MarketSwitcher = () => {
  const { market, changeMarket } = useMarketStore();

  const switchMarket = () => {
    changeMarket(
      market === DeployedMarket.USDC ? DeployedMarket.USDT : DeployedMarket.USDC
    );
  };

  return <Button onMouseDown={switchMarket}>{market}</Button>;
};
