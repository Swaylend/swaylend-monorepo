/**
 * withdraw-reserves.ts — TS port of scripts/src/withdraw_reserves.rs
 *
 * Withdraws base-asset reserves from the market to a recipient (address or contract).
 *
 * Usage:
 *   pnpm withdraw-reserves <amount>                         # recipient defaults to vault address
 *   pnpm withdraw-reserves <amount> address:0x...
 *   pnpm withdraw-reserves <amount> contract:0x...
 *
 * Notes:
 *  - `amount` is denominated in base-asset smallest units (e.g. 1 USDC = 1_000_000).
 *  - On the Rust side this used `VariableOutputPolicy::Exactly(1)`. In TS that's
 *    `.txParams({ variableOutputs: 1 })`.
 */

import { Address, bn } from 'fuels';
import type { IdentityInput } from '../sway-api/Market';
import { createBakoVault, waitForBakoTxWithFallback } from '../lib/bako';
import { config, requireField } from '../lib/config';
import { getMarket } from '../lib/contracts';
import { formatIdentity, parseIdentity } from '../lib/identity';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';

async function getRecipientBalance(provider: any, recipient: IdentityInput, assetId: string): Promise<bigint> {
  if (recipient.Address) {
    const balance = await provider.getBalance(new Address(recipient.Address.bits), assetId);
    return BigInt(balance.toString());
  }
  if (recipient.ContractId) {
    const balance = await provider.getContractBalance(recipient.ContractId.bits, assetId);
    return BigInt(balance.toString());
  }
  return 0n;
}

export async function withdrawReserves(amountStr: string, recipientSpec?: string) {
  const amount = bn(amountStr);
  if (amount.lte(0)) throw new Error('amount must be > 0');

  const { vault, provider } = await createBakoVault();
  await verifyNetwork(provider, config.network);

  const recipient: IdentityInput = recipientSpec
    ? parseIdentity(recipientSpec)
    : { Address: { bits: vault.address.toB256() } };

  console.log(`Signer (Bako vault): ${vault.address.toB256()}`);
  console.log(`Market (via proxy):  ${requireField('proxyContractId')}`);
  console.log(`Recipient:           ${formatIdentity(recipient)}`);
  console.log(`Amount:              ${amount.toString()} (raw)`);

  const market = getMarket(vault);

  const version = (await market.functions.get_version().get()).value;
  console.log(`Market version: ${version}`);

  const marketCfg = (await market.functions.get_market_configuration().get()).value;
  const baseAssetId: string = marketCfg.base_token.bits;
  const baseDecimals: number = Number(marketCfg.base_token_decimals);
  console.log(`Base asset: ${baseAssetId} (decimals ${baseDecimals})`);

  const beforeReserves = (await market.functions.get_reserves().get()).value;
  console.log(`Current reserves (raw): ${beforeReserves.toString()}`);

  const beforeRecipient = await getRecipientBalance(provider, recipient, baseAssetId);
  console.log(`Recipient balance before (raw): ${beforeRecipient.toString()}`);

  if (!(await confirm(`Withdraw ${amount.toString()} (raw base units) to ${formatIdentity(recipient)}?`))) {
    console.log('Aborted.');
    return;
  }

  console.log('\nSubmitting withdraw_reserves...');
  console.log('Required signers must approve at https://safe.bako.global');

  const extraContracts: string[] = [];
  if (recipient.ContractId) extraContracts.push(recipient.ContractId.bits);

  const interval = setInterval(() => {
    console.log('⏳ Waiting for Bako signatures + tx confirmation...');
  }, 5000);

  try {
    const tx = await market.functions
      .withdraw_reserves(recipient, amount)
      .txParams({ variableOutputs: 1 })
      .addContracts(extraContracts.map((id) => ({ id, contractId: id } as any)))
      .call();
    const result = await waitForBakoTxWithFallback(tx, 'withdraw_reserves');
    clearInterval(interval);
    if (result) console.log('✅ Tx mined:', result.transactionId);
  } finally {
    clearInterval(interval);
  }

  const afterReserves = (await market.functions.get_reserves().get()).value;
  const afterRecipient = await getRecipientBalance(provider, recipient, baseAssetId);
  console.log(`Reserves after  (raw): ${afterReserves.toString()}`);
  console.log(`Recipient after (raw): ${afterRecipient.toString()}`);
}

const [amountArg, recipientArg] = process.argv.slice(2);
if (!amountArg) {
  console.error('Usage: pnpm withdraw-reserves <amount> [address:0x...|contract:0x...]');
  process.exit(1);
}

withdrawReserves(amountArg, recipientArg).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
