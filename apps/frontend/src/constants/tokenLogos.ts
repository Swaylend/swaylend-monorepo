import unknown from '@src/assets/notFound.svg';
import bnb from '@src/assets/tokens/BNB.svg';
import busd from '@src/assets/tokens/BUSD.svg';
import btc from '@src/assets/tokens/bitcoin.svg';
import chainlink from '@src/assets/tokens/chainlink.svg';
import compound from '@src/assets/tokens/compound.svg';
import eth from '@src/assets/tokens/ethereum.svg';
import sway from '@src/assets/tokens/sway.svg';
import uni from '@src/assets/tokens/uni.svg';
import usdc from '@src/assets/tokens/usdc.svg';
import usdt from '@src/assets/tokens/usdt.svg';

const tokenLogos: Record<string, string> = {
  ETH: eth,
  USDT: usdt,
  BNB: bnb,
  BTC: btc,
  BUSD: busd,
  USDC: usdc,
  UNI: uni,
  LINK: chainlink,
  SWAY: sway,
  COMP: compound,
  UNKNOWN: unknown,
};

export default tokenLogos;
