/**
 * deploy-market.ts — convenience script for fresh testnet deploys.
 *
 * Not present in the Rust scripts (those assume `forc deploy` does this).
 * Uses the bundled bytecode at scripts-ts/abis/market.bin via the typegen factory.
 *
 * Note: this deploys the market IMPLEMENTATION contract directly, not behind a
 * proxy. For testnet experimentation that's fine — point PROXY_CONTRACT_ID at
 * the resulting id and call activate_market against it. For production, the
 * full deploy uses an SRC-14 upgradable proxy in front.
 *
 * Usage:
 *   pnpm deploy-market
 */

import { config } from '../lib/config';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';
import { createWallet } from '../lib/wallet';
import { MarketFactory } from '../sway-api/MarketFactory';

export async function deployMarket() {
  const { wallet, provider } = await createWallet();
  await verifyNetwork(provider, config.network);

  console.log(`Deployer: ${wallet.address.toB256()}`);
  console.log(`Network:  ${config.network}`);

  if (!(await confirm('Deploy a new Market implementation contract?'))) {
    console.log('Aborted.');
    return;
  }

  const { waitForResult } = await MarketFactory.deploy(wallet);
  const { contract } = await waitForResult();
  const contractId = contract.id.toB256();

  console.log(`✅ Market contract deployed at: ${contractId}`);
  console.log('\nAdd these to your .env:');
  console.log(`PROXY_CONTRACT_ID=${contractId}    # no proxy; pointing at market directly`);
  console.log(`TARGET_CONTRACT_ID=${contractId}`);
}

deployMarket().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
