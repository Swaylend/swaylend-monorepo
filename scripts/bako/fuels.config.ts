import { createConfig } from 'fuels';

export default createConfig({
  scripts: [
    './withdraw_reserves',
    './update_collaterals',
    './update_market',
    './change_market_owner',
  ],
  contracts: ['../../contracts/market'],
  output: './src/types',
});
