import { Wallet } from 'fuels';
import { BakoProvider, Vault } from 'bakosafe';
import { Market, UpdateCollaterals } from './types';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import type { CollateralConfigurationInput } from './types/contracts/Market';

dotenv.config({ path: '../.env' });
type CollateralAssetConfig = {
  asset_id: string;
  price_feed_id: string;
  name: string;
  symbol: string;
  decimals: number;
  borrow_collateral_factor: number;
  liquidate_collateral_factor: number;
  liquidation_penalty: number;
  supply_cap: number;
  is_active: boolean;
};

function castConfigInto(
  asset: CollateralAssetConfig
): CollateralConfigurationInput {
  return {
    asset_id: { bits: asset.asset_id },
    price_feed_id: asset.price_feed_id,
    decimals: asset.decimals,
    borrow_collateral_factor: asset.borrow_collateral_factor.toString(),
    liquidate_collateral_factor: asset.liquidate_collateral_factor.toString(),
    liquidation_penalty: asset.liquidation_penalty.toString(),
    supply_cap: asset.supply_cap.toString(),
    paused: !asset.is_active,
  };
}

const PROVIDER_URL =
  process.env.PROVIDER_URL || 'https://testnet.fuel.network/v1/graphql';
const PRIVATE_KEY = process.env.SIGNING_KEY!;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS!;
const PROXY_CONTRACT_ID = process.env.PROXY_CONTRACT_ID!;
const TARGET_CONTRACT_ID = process.env.TARGET_CONTRACT_ID!;

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error(
      'Please provide the config path as a command-line argument: pnpm updateCollateral ../config/testnet_usdc_config.json'
    );
    process.exit(1);
  }

  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY);
  const challenge = await BakoProvider.setup({
    address: wallet.address.toB256(),
    provider: PROVIDER_URL,
  });
  const token = await wallet.signMessage(challenge);
  const provider = await BakoProvider.authenticate(PROVIDER_URL, {
    token,
    challenge,
    address: wallet.address.toB256(),
  });
  const market = new Market(PROXY_CONTRACT_ID, provider);

  const newCollateralConfig: CollateralAssetConfig[] = JSON.parse(
    readFileSync(configPath, 'utf8')
  ).collateral_assets;

  const currCollateralConfig = (
    await market.functions.get_collateral_configurations().get()
  ).value;

  const collateralsToUpdate: CollateralConfigurationInput[] = [];
  const collateralsToAdd: CollateralConfigurationInput[] = [];
  for (const newAsset of newCollateralConfig) {
    const currAsset = currCollateralConfig.find(
      (asset) => asset.asset_id.bits === newAsset.asset_id
    );
    const normalizedNewAsset = castConfigInto(newAsset);

    if (!currAsset) {
      console.log(
        `New asset will be added: ${newAsset.name} - ${normalizedNewAsset.asset_id.bits}`
      );
      collateralsToAdd.push(normalizedNewAsset);
      continue;
    }

    const changes: string[] = [];

    for (const key in normalizedNewAsset) {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: need this here
      if (currAsset.hasOwnProperty(key)) {
        let newValue = normalizedNewAsset[key];
        let currValue = currAsset[key];

        if (key === 'asset_id') {
          newValue = normalizedNewAsset.asset_id.bits;
          currValue = currAsset.asset_id.bits;
        }
        if (newValue.toString() !== currValue.toString()) {
          changes.push(`${key}: ${currValue} -> ${newValue}`);
        }
      }
    }

    if (changes.length > 0) {
      console.log(
        `New params for ${newAsset.name} - ${normalizedNewAsset.asset_id.bits}`
      );
      changes.forEach((change) => console.log(change));
      collateralsToUpdate.push(normalizedNewAsset);
    }
  }
  console.log('Changes below will be pushed');
  console.log(collateralsToUpdate);

  const vault = await Vault.fromAddress(VAULT_ADDRESS, provider);
  const script = new UpdateCollaterals(vault);
  const proxyId = { bits: PROXY_CONTRACT_ID };

  const configurableConstants = {
    MARKET_CONTRACT_ID: proxyId,
  };

  script.setConfigurableConstants(configurableConstants);
  const request = await script.functions
    .main(collateralsToUpdate, collateralsToAdd)
    .addContracts([market])
    .getTransactionRequest();

  const { hashTxId } = await vault.BakoTransfer(request, {
    name: `Update ${collateralsToUpdate.length} collateral assets`,
  });
  console.log('Transaction ID:', hashTxId);
};

main().catch((err) => {
  console.error('Error updating collateral assets:', err);
});
