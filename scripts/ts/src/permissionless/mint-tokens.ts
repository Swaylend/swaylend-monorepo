/**
 * mint-tokens.ts — TS port of scripts/src/mint_tokens.rs
 *
 * Mints test tokens (base + collateral, skipping ETH) on a Token contract
 * (typically the one produced by `pnpm deploy-tokens`).
 *
 * The sub_id for each asset is `sha256(symbol)`. The minted asset id is then
 * `getMintedAssetId(token_contract_id, sub_id)`. This must match the
 * `asset_id` declared in the market config JSON for the lending market to
 * recognize the asset.
 *
 * Usage:
 *   pnpm mint-tokens <path/to/config.json>
 *   pnpm mint-tokens <path/to/config.json> --amount 100000
 *   pnpm mint-tokens <path/to/config.json> --amount 100000 --recipient address:0x...
 */

import { Address, bn, getMintedAssetId, hashMessage } from 'fuels';
import { config, requireField } from '../lib/config';
import type { IdentityInput } from '../sway-api/Market';
import { Token } from '../sway-api/Token';
import { parseIdentity } from '../lib/identity';
import { readMarketConfig } from '../lib/marketConfig';
import { verifyNetwork } from '../lib/network';
import { createWallet } from '../lib/wallet';

function getSymbolHash(symbol: string): string {
  // Matches the swaylend frontend (`hashMessage(symbol)`) and the Rust
  // token_sdk::get_symbol_hash — Ethereum-style prefixed-message hash.
  return hashMessage(symbol);
}

function parseArgs(argv: string[]): { configPath: string; amount: string; recipient?: string } {
  if (!argv[0]) {
    console.error(
      'Usage: pnpm mint-tokens <path/to/config.json> [--amount N] [--recipient address:0x...|contract:0x...]',
    );
    process.exit(1);
  }
  const configPath = argv[0];
  let amount = '100000';
  let recipient: string | undefined;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--amount') amount = argv[++i] ?? amount;
    else if (argv[i] === '--recipient') recipient = argv[++i];
  }
  return { configPath, amount, recipient };
}

export async function mintTokens(configPath: string, amountRaw: string, recipientSpec?: string) {
  const cfg = readMarketConfig(configPath);
  const amount = bn(amountRaw);

  const { wallet, provider } = await createWallet();
  await verifyNetwork(provider, config.network);

  const tokenContractId = requireField('tokenContractId');
  const token = new Token(tokenContractId, wallet);

  const recipient: IdentityInput = recipientSpec
    ? parseIdentity(recipientSpec)
    : { Address: { bits: wallet.address.toB256() } };

  console.log(`Token contract: ${tokenContractId}`);
  console.log(`Recipient: ${JSON.stringify(recipient)}`);
  console.log(`Amount each: ${amount.toString()}`);

  // base asset + all collateral assets except native ETH (cannot be minted by us)
  const targets = [
    cfg.base_asset,
    ...cfg.collateral_assets.filter((a) => a.symbol !== 'ETH'),
  ];

  for (const asset of targets) {
    const subId = getSymbolHash(asset.symbol);
    const expectedAssetId = getMintedAssetId(tokenContractId, subId);
    console.log(`\nMinting ${asset.symbol}`);
    console.log(`  sub_id:           ${subId}`);
    console.log(`  computed assetId: ${expectedAssetId}`);
    console.log(`  config assetId:   ${asset.asset_id}`);
    if (expectedAssetId.toLowerCase() !== asset.asset_id.toLowerCase()) {
      console.warn('  ⚠️  Computed asset id does NOT match config asset id. Continuing anyway.');
    }

    // Initialize metadata for this sub_id (no-op if already set). Done in one multicall.
    const existingDecimals = (await token.functions.decimals({ bits: expectedAssetId }).get()).value;
    if (existingDecimals === undefined) {
      console.log(`  initializing name/symbol/decimals for ${asset.symbol}...`);
      const initTx = await token
        .multiCall([
          token.functions.set_decimals(subId, asset.decimals),
          token.functions.set_name(subId, asset.name),
          token.functions.set_symbol(subId, asset.symbol),
        ])
        .call();
      await initTx.waitForResult();
      console.log('  ✓ metadata set');
    }

    const txResp = await token.functions
      .mint(recipient, subId, amount.toString())
      .txParams({ gasLimit: 2_000_000 })
      .call();
    const result = await txResp.waitForResult();
    console.log(`  ✅ minted (tx ${result.transactionId})`);

    // verify balance
    if (recipient.Address) {
      const bal = await provider.getBalance(new Address(recipient.Address.bits), expectedAssetId);
      console.log(`  recipient balance: ${bal.toString()}`);
    } else if (recipient.ContractId) {
      const bal = await provider.getContractBalance(recipient.ContractId.bits, expectedAssetId);
      console.log(`  recipient (contract) balance: ${bal.toString()}`);
    }
  }
}

const args = parseArgs(process.argv.slice(2));
mintTokens(args.configPath, args.amount, args.recipient).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
