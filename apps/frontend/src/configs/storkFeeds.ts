/**
 * Pyth price feed id (as stored in the market config) -> Stork asset.
 *
 * Must stay in sync with scripts/ts/configs/stork-feeds.mainnet.json, which is
 * what the stork-pyth-adapter contract is configured with. `exponent` and
 * `confBps` mirror the adapter's per-feed settings so the numbers shown here
 * match what the contract computes.
 *
 * ezETH and sDAI were added by Stork on 2026-09-18 at our request, so all
 * eight market assets are covered.
 */
export type StorkFeed = {
  asset: string;
  /** Absolute value of the reported Pyth exponent, e.g. 8 for 10^-8. */
  exponent: number;
  /** Synthetic confidence as basis points of price. */
  confBps: number;
};

export const STORK_FEEDS: Record<string, StorkFeed> = {
  '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a': {
    asset: 'USDCUSD',
    exponent: 7,
    confBps: 5,
  },
  '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace': {
    asset: 'ETHUSD',
    exponent: 8,
    confBps: 10,
  },
  '0x06c217a791f5c4f988b36629af4cb88fad827b2485400a358f3b02886b54de92': {
    asset: 'EZETHUSD',
    exponent: 8,
    confBps: 15,
  },
  '0x710659c5a68e2416ce4264ca8d50d34acc20041d91289110eea152c52ff3dc39': {
    asset: 'SDAIUSD',
    exponent: 8,
    confBps: 10,
  },
  '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b': {
    asset: 'USDTUSD',
    exponent: 7,
    confBps: 5,
  },
  '0x9ee4e7c60b940440a261eb54b6d8149c23b580ed7da3139f7f08f4ea29dad395': {
    asset: 'WEETHUSD',
    exponent: 8,
    confBps: 15,
  },
  '0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784': {
    asset: 'WSTETHUSD',
    exponent: 8,
    confBps: 15,
  },
  '0x8a757d54e5d34c7ff1aea8502a2d968686027a304d00418092aaf7e60ed98d95': {
    asset: 'FUELUSD',
    exponent: 12,
    confBps: 25,
  },
};

export function getStorkFeed(priceFeedId: string): StorkFeed | undefined {
  return STORK_FEEDS[priceFeedId.toLowerCase()];
}
