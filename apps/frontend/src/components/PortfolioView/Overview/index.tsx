import React from 'react';
import { InfoIcon } from '../../InfoIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Liquidity } from './Liquidity';
import { Collateral } from './Collateral';
import { Borrow } from './Borrow';

export const Overview = () => {
  return (
    <div>
      <Liquidity />

      <Collateral />

      <Borrow />
    </div>
  );
};
