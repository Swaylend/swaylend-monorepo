import { createConfig } from 'fuels';

export default createConfig({
  scripts: ['./withdraw_reserves', './update_collaterals', 'update_market'],
  contracts: ['../../contracts/market'],
  output: './src/types',
});
