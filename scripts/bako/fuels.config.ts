import { createConfig } from 'fuels';

export default createConfig({
  scripts: ['./withdraw_reserves'],
  contracts: ['../../contracts/market'],
  output: './src/types',
});
