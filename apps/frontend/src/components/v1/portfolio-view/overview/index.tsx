import React from 'react';

import { Borrow } from './borrow';
import { Collateral } from './collateral';
import { Liquidity } from './liquidity';

export const Overview = () => {
  return (
    <div>
      <Liquidity />
      <Collateral />
      <Borrow />
    </div>
  );
};
