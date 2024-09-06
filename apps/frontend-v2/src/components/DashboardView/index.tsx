'use client';
import React from 'react';
import { AssetsTable } from './AssetsTable';
import { Input } from './Input';
import { MarketSwitch } from './MarketSwitch';
import { Stats } from './Stats';

export const DashboardView = () => {
  return (
    <div className="pt-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <Stats />
      <MarketSwitch />
      <AssetsTable />
      <div className="mt-[100px]">
        <Input />
      </div>
    </div>
  );
};
