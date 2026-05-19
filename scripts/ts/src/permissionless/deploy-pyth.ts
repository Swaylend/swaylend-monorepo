/**
 * deploy-pyth.ts — TS port of scripts/src/deploy_pyth.rs
 *
 * Deploys a fresh PythMock contract for testnet/devnet use.
 * Permissionless — anyone can deploy. Mainnet uses the real Pyth contract, not this mock.
 *
 * Usage:
 *   pnpm deploy-pyth
 */

import { config } from '../lib/config';
import { verifyNetwork } from '../lib/network';
import { confirm } from '../lib/prompt';
import { createWallet } from '../lib/wallet';
import { PythMockFactory } from '../sway-api/PythMockFactory';

export async function deployPyth() {
  const { wallet, provider } = await createWallet();
  await verifyNetwork(provider, config.network);

  console.log(`Deployer: ${wallet.address.toB256()}`);
  console.log(`Network:  ${config.network}`);

  if (config.network === 'mainnet') {
    console.warn('⚠️  PythMock should not be deployed on mainnet — use the real Pyth contract.');
    if (!(await confirm('Continue anyway?'))) {
      console.log('Aborted.');
      return;
    }
  } else if (!(await confirm('Deploy a new PythMock contract?'))) {
    console.log('Aborted.');
    return;
  }

  const { waitForResult } = await PythMockFactory.deploy(wallet);
  const { contract } = await waitForResult();
  const contractId = contract.id.toB256();

  console.log(`✅ PythMock contract deployed at: ${contractId}`);
  console.log('\nAdd this to your .env:');
  console.log(`PYTH_CONTRACT_ID=${contractId}`);
}

deployPyth().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
