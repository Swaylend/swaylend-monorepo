/**
 * fill-reserves.ts — TS port of scripts/src/fill_reserves.rs
 *
 * Transfers <amount> base-asset tokens from the signing wallet to the market
 * contract, increasing its reserves. Permissionless — anyone can top up.
 *
 * Usage:
 *   pnpm fill-reserves <amount>
 */

import { Address, bn } from 'fuels';
import { config, requireField } from '../lib/config';
import { getMarket } from '../lib/contracts';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';
import { createWallet } from '../lib/wallet';

export async function fillReserves(amountStr: string) {
  const amount = bn(amountStr);
  if (amount.lte(0)) throw new Error('amount must be > 0');

  const { wallet, provider } = await createWallet();
  await verifyNetwork(provider, config.network);

  const proxyId = requireField('proxyContractId');
  console.log(`Signer:             ${wallet.address.toB256()}`);
  console.log(`Market (via proxy): ${proxyId}`);
  console.log(`Amount:             ${amount.toString()} (raw)`);

  const market = getMarket(wallet);
  const version = (await market.functions.get_version().get()).value;
  console.log(`Market version: ${version}`);

  const marketCfg = (await market.functions.get_market_configuration().get()).value;
  const baseAssetId: string = marketCfg.base_token.bits;
  console.log(`Base asset: ${baseAssetId}`);

  const balance = await provider.getBalance(wallet.address, baseAssetId);
  console.log(`Wallet base-asset balance: ${balance.toString()}`);
  if (balance.lt(amount)) {
    throw new Error(`Wallet balance ${balance.toString()} < requested amount ${amount.toString()}`);
  }

  const beforeReserves = (await market.functions.get_reserves().get()).value;
  console.log(`Reserves before: ${beforeReserves.toString()}`);

  if (!(await confirm(`Send ${amount.toString()} (raw) to ${proxyId}?`))) {
    console.log('Aborted.');
    return;
  }

  console.log('Submitting force_transfer_to_contract...');
  const txResp = await wallet.transferToContract(new Address(proxyId), amount, baseAssetId);
  const result = await txResp.waitForResult();
  console.log('✅ tx mined:', result.id);

  const afterReserves = (await market.functions.get_reserves().get()).value;
  console.log(`Reserves after:  ${afterReserves.toString()}`);
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: pnpm fill-reserves <amount>');
  process.exit(1);
}

fillReserves(arg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
