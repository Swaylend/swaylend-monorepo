'use client';

import { useIsConnected } from '@fuels/react';
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { History } from './History';
import { Overview } from './Overview';
import { Stats } from './Stats';

export const PortfolioView = () => {
  const [portfolioView, setPortfolioView] = useState('overview');
  const { isConnected } = useIsConnected();

  const handleChange = (value: any) => {
    setPortfolioView(value);
  };

  if (!isConnected) {
    return (
      <div className="w-full text-lg flex items-center justify-center h-[300px]">
        Connect Wallet to view your portfolio.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Stats />
      <div className="mt-12">
        <Tabs
          onValueChange={handleChange}
          defaultValue={portfolioView}
          className="mt-[40px] sm:mt-[55px]"
        >
          <TabsList className="max-sm:h-[40px]">
            <TabsTrigger value="overview" className="max-sm:py-1.5 max-sm:px-6">
              Positions Overview
            </TabsTrigger>
            <TabsTrigger className="max-sm:py-1.5 max-sm:px-6" value="history">
              Transaction History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-8">
        {portfolioView === 'overview' && <Overview />}
        {portfolioView === 'history' && <History />}
      </div>
    </div>
  );
};
