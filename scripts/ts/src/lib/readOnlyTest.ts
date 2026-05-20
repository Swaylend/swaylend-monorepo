/**
 * Smoke test — read-only sanity check against testnet.
 * Doesn't sign, doesn't write, just confirms typegen + RPC + verifyNetwork.
 */

import { Provider, Wallet } from 'fuels';
import { Market } from '../sway-api/Market';
import { Proxy } from '../sway-api/Proxy';
import { verifyNetwork } from './network';

const TESTNET_RPC = 'https://testnet.fuel.network/v1/graphql';
const USDC_PROXY = '0xc95ba29f6172eccb58d489f9db30374ee593fadf962d215b33e79d2be2534ec1';

async function main() {
  const provider = new Provider(TESTNET_RPC);
  await verifyNetwork(provider, 'testnet');

  const wallet = Wallet.generate({ provider }); // read-only

  console.log(`\n— Reading public state from testnet USDC market —`);
  console.log(`Proxy: ${USDC_PROXY}`);

  const proxy = new Proxy(USDC_PROXY, wallet);
  const proxyOwner = (await proxy.functions.proxy_owner().get()).value;
  console.log('Proxy owner:', JSON.stringify(proxyOwner));

  const target = (await proxy.functions.proxy_target().get()).value;
  console.log('Proxy target:', JSON.stringify(target));

  const market = new Market(USDC_PROXY, wallet);
  const version = (await market.functions.get_version().get()).value;
  console.log('Market version:', version);

  const owner = (await market.functions.owner().get()).value;
  console.log('Market owner:', JSON.stringify(owner));

  const cfg = (await market.functions.get_market_configuration().get()).value;
  console.log('Base asset:', cfg.base_token.bits, `(decimals ${cfg.base_token_decimals})`);

  const reserves = (await market.functions.get_reserves().get()).value;
  console.log('Reserves (raw):', reserves.toString());

  const collateral = (await market.functions.get_collateral_configurations().get()).value;
  console.log(`Collateral assets configured: ${collateral.length}`);
  for (const c of collateral) {
    console.log(`  - ${c.asset_id.bits.slice(0, 10)}…  paused=${c.paused}  cap=${c.supply_cap.toString()}`);
  }

  console.log('\n✅ All read-only paths returned data. Typegen + RPC + Provider wiring OK.');
}

main().catch((err) => {
  console.error('❌ Read-only smoke test failed:', err);
  process.exit(1);
});
