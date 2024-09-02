'use client';
import { useMarketStore } from '@/stores';
import { Button } from '../ui/button';
import { DeployedMarket } from '@/utils';

export const MarketSwitcher = () => {
  const { market, changeMarket } = useMarketStore();

  const switchMarket = () => {
    changeMarket(
      market === DeployedMarket.USDC ? DeployedMarket.USDT : DeployedMarket.USDC
    );
  };

  return <Button onMouseDown={switchMarket}>{market}</Button>;
};
