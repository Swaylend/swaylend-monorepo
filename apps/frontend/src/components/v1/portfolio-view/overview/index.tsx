import React from 'react';

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
