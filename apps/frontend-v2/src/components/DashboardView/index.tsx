'use client';
import React from 'react';
import { AssetsTable } from './AssetsTable';
import { Header } from './Header';
import { Input } from './Input';
import { MarketSwitch } from './MarketSwitch';

export const DashboardView = () => {
  return (
    <div className="pt-[55px] px-[88px] flex flex-col w-full gap-y-8 items-center justify-center">
      <Header />
      <MarketSwitch />
      <AssetsTable />
      <Input />
    </div>
  );
};
