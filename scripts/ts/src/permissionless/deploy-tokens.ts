/**
 * deploy-tokens.ts — TS port of scripts/src/deploy_tokens.rs
 *
 * Deploys a fresh Token contract using the bundled bytecode at
 * scripts-ts/abis/token.bin. Permissionless — anyone can deploy.
 *
 * Usage:
 *   pnpm deploy-tokens
 */

import { config } from '../lib/config';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';
import { createWallet } from '../lib/wallet';
import { TokenFactory } from '../sway-api/TokenFactory';

export async function deployTokens() {
  const { wallet, provider } = await createWallet();
  await verifyNetwork(provider, config.network);

  console.log(`Deployer: ${wallet.address.toB256()}`);
  console.log(`Network:  ${config.network}`);

  if (!(await confirm('Deploy a new Token contract?'))) {
    console.log('Aborted.');
    return;
  }

  const { waitForResult } = await TokenFactory.deploy(wallet);
  const { contract } = await waitForResult();
  const contractId = contract.id.toB256();

  console.log(`✅ Token contract deployed at: ${contractId}`);
  console.log('\nAdd this to your .env:');
  console.log(`TOKEN_CONTRACT_ID=${contractId}`);
}

deployTokens().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
