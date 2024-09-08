'use client';
import React from 'react';
import { AssetsTable } from './AssetsTable';
import { MarketSwitch } from './MarketSwitch';
import { Stats } from './Stats';
import { InputDialog } from '../InputDialog';

export const DashboardView = () => {
  return (
    <div className="pt-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <Stats />
      <MarketSwitch />
      <AssetsTable />
      <InputDialog />
    </div>
  );
};
