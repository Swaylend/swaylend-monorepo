'use client';

import { useIsConnected } from '@fuels/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { History } from './history';
import { Markets } from './markets';
import { Overview } from './overview';
// import { Rewards } from './rewards';
import { Stats } from './stats';

export const PortfolioView = () => {
  const [portfolioView, setPortfolioView] = useState('markets');
  const { isConnected } = useIsConnected();

  const handleChange = (value: any) => {
    setPortfolioView(value);
  };

  if (!isConnected) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-lg">
        Connect Wallet to view your portfolio.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Stats />
      <div className="mt-12">
        <Tabs
          className="mt-[40px] sm:mt-[55px]"
          defaultValue={portfolioView}
          onValueChange={handleChange}
        >
          <TabsList className="h-[50px] w-[600px] rounded-full">
            <TabsTrigger
              className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
              value="markets"
            >
              My Markets
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
              value="positions"
            >
              My Positions
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
              value="history"
            >
              My Transactions
            </TabsTrigger>
            {/* <TabsTrigger value="rewards" className="max-sm:py-1.5 max-sm:px-6">
              Rewards
            </TabsTrigger> */}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-8">
        {portfolioView === 'markets' && <Markets />}
        {portfolioView === 'positions' && <Overview />}
        {portfolioView === 'history' && <History />}
        {/* {portfolioView === 'rewards' && <Rewards />} */}
      </div>
    </div>
  );
};
