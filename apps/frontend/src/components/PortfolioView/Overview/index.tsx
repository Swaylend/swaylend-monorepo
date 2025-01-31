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
import { Borrow } from './Borrow';
import { Collateral } from './Collateral';
import { Liquidity } from './Liquidity';

export const Overview = () => {
  return (
    <div>
      <Liquidity />

      <Collateral />

      <Borrow />
    </div>
  );
};
