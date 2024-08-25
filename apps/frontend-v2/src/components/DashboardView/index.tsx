'use client';
import React from 'react';
import { Header } from './Header';
import { Input } from './Input';
import { Table } from './Table';

export const DashboardView = () => {
  return (
    <div>
      <Header />
      <Table />
      <Input />
    </div>
  );
};
