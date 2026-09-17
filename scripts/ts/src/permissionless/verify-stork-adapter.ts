/**
 * verify-stork-adapter.ts — prove a deployed adapter serves correct prices.
 *
 * Writes a real Stork update through the adapter, then reads every feed back
 * over the Pyth ABI and asserts the value, exponent, synthetic confidence and
 * freshness are exactly what the market will see. Run this against the adapter
 * before pointing a market at it.
 *
 * Usage:
 *   ADAPTER_ID=0x... pnpm verify-stork-adapter configs/stork-feeds.testnet.json
 */

import { Contract, DateTime, Provider, Wallet, arrayify } from 'fuels';
import storkAbi from '../../abis/stork-abi.json';

import { readFileSync } from 'node:fs';
import { config } from '../lib/config';
import {
  encodeStorkUpdate,
  fetchStorkPrices,
  toDecimal,
  toPythPrice,
} from '../lib/stork';
import { StorkPythAdapter } from '../sway-api/StorkPythAdapter';

type FeedsConfig = {
  storkContractId: string;
  feeds: {
    symbol: string;
    storkAsset: string;
    priceFeedId: string;
    exponent: number;
    confBps: number;
  }[];
};

const configPath = process.argv[2];
if (!configPath || !process.env.ADAPTER_ID) {
  console.error(
    'Usage: ADAPTER_ID=0x... pnpm verify-stork-adapter <path/to/stork-feeds.json>'
  );
  process.exit(1);
}
const feeds = JSON.parse(readFileSync(configPath, 'utf8')) as FeedsConfig;

const ADAPTER = process.env.ADAPTER_ID!;

(async () => {
  const provider = new Provider(config.providerUrl!);
  const wallet = Wallet.fromPrivateKey(config.signingKey!, provider);
  const adapter = new StorkPythAdapter(ADAPTER, wallet);

  // Minimal handle so the adapter's external call to Stork is declared on the tx.
  const stork = new Contract(feeds.storkContractId, storkAbi as any, wallet);

  const prices = await fetchStorkPrices(feeds.feeds.map((f) => f.storkAsset));

  const updateData: Uint8Array[] = [];
  const publishTimes: string[] = [];
  const priceFeedIds: string[] = [];
  for (const f of feeds.feeds) {
    const p = prices.get(f.storkAsset)!;
    updateData.push(arrayify(encodeStorkUpdate(p)));
    publishTimes.push(
      DateTime.fromUnixSeconds(Number(p.timestampNs / 1_000_000_000n)).toTai64()
    );
    priceFeedIds.push(f.priceFeedId);
  }

  const { value: fee } = await adapter.functions
    .update_fee(updateData)
    .addContracts([stork])
    .get();
  console.log(`update_fee (via Stork.get_update_fee_v1): ${fee.toString()}`);

  console.log('→ update_price_feeds_if_necessary ...');
  const call = await adapter.functions
    .update_price_feeds_if_necessary(priceFeedIds, publishTimes, updateData)
    .addContracts([stork])
    .callParams({
      forward: { amount: fee, assetId: await provider.getBaseAssetId() },
    })
    .call();
  const res = await call.waitForResult();
  console.log(`   mined: ${res.transactionId}`);

  console.log('\n→ Reading prices back through the Pyth ABI:');
  let allOk = true;
  for (const f of feeds.feeds) {
    const { value } = await adapter.functions
      .price(f.priceFeedId)
      .addContracts([stork])
      .get();
    const quantized = prices.get(f.storkAsset)!.quantizedValue;

    // Exact: the adapter must report precisely the quantized value at the
    // configured exponent, not merely something close to it.
    const expectedPrice = toPythPrice(quantized, f.exponent);
    const expectedConf = (expectedPrice * BigInt(f.confBps)) / 10000n;
    const priceOk = BigInt(value.price.toString()) === expectedPrice;
    const expoOk = Number(value.exponent) === f.exponent;
    const confOk = BigInt(value.confidence.toString()) === expectedConf;
    // TAI64 = unix seconds + 2^62, and must be recent enough for the market's
    // 60s staleness window.
    const unix = BigInt(value.publish_time.toString()) - (1n << 62n);
    const age = Math.floor(Date.now() / 1000) - Number(unix);
    const freshOk = age >= 0 && age < 60;
    const ok = priceOk && expoOk && confOk && freshOk;
    allOk &&= ok;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'} ${f.symbol.padEnd(7)} $${toDecimal(quantized).toFixed(10)}` +
        ` onchain=${value.price.toString()} expected=${expectedPrice} expo=${value.exponent}` +
        ` conf=${value.confidence.toString()} age=${age}s` +
        `${ok ? '' : `  [price=${priceOk} expo=${expoOk} conf=${confOk} fresh=${freshOk}]`}`
    );
  }
  console.log(`\nend-to-end: ${allOk ? 'ALL PASS' : 'FAILURES'}`);
  process.exit(allOk ? 0 : 1);
})().catch((e) => {
  const logs = e?.metadata?.logs ?? e?.logs;
  if (logs) console.error('STORK ERROR LOGS:', JSON.stringify(logs, null, 1));
  console.error('reason:', e?.metadata?.reason ?? e?.message);
  process.exit(1);
});
