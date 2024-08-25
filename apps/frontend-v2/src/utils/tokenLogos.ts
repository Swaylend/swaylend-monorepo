import unknown from '/public/notFound.svg?url';
import btc from '/public/tokens/bitcoin.svg?url';
import eth from '/public/tokens/ethereum.svg?url';
import uni from '/public/tokens/uni.svg?url';
import usdc from '/public/tokens/usdc.svg?url';

const tokenLogos: Record<string, string> = {
  ETH: eth,
  BTC: btc,
  USDC: usdc,
  UNI: uni,
  UNKNOWN: unknown,
};

export default tokenLogos;
