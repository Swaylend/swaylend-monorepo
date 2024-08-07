import borrow from '@src/assets/tutorials/borrowUSDC.svg';
import walletConnect from '@src/assets/tutorials/connect.svg';
import mintETH from '@src/assets/tutorials/mint.svg';
import supplyCollateral from '@src/assets/tutorials/supply.svg';

const tutorials = [
  {
    id: 'connect',
    title: '#0: Wallet connection',
    complexity: 'Low',
    time: '10 min',
    pic: walletConnect,
    link: 'https://docs.google.com/forms/d/e/1FAIpQLScqNaQ-oH-gfSabxW7k5qfMLNttSwNucOdKRVJemL1bvy0Guw/viewform?embedded=true',
  },
  {
    id: 'mint',
    title: '#1: Mint of ETH and collateral',
    complexity: 'Medium',
    time: '15 min',
    pic: mintETH,
  },
  {
    id: 'supply',
    title: '#2: Supply of the collateral',
    complexity: 'Low',
    time: '10 min',
    pic: supplyCollateral,
  },
  {
    id: 'borrow',
    title: '#3: Borrow',
    complexity: 'Low',
    time: '10 min',
    pic: borrow,
  },
];
export default tutorials;
