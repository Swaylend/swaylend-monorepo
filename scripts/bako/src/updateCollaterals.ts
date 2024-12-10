import { Wallet } from 'fuels';
import { BakoProvider, Vault } from 'bakosafe';
import { Market } from './types';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';

dotenv.config({ path: '../.env' });

interface CollateralAssetConfig {
  asset_id: string;
  // Add any other properties you need
}

interface MarketConfig {
  collateral_assets: CollateralAssetConfig[];
}

const main = async () => {
  console.log('UPDATE COLLATERAL ASSETS');

  const configPath = process.argv[2];
  if (!configPath) {
    console.error('Please provide the config path as a command-line argument.');
    process.exit(1);
  }

  const providerUrl = process.env.PROVIDER_URL!;
  const signingKey = process.env.SIGNING_KEY!;
  const proxyContractId = process.env.PROXY_CONTRACT_ID!;
  const targetContractId = process.env.TARGET_CONTRACT_ID!;

  const wallet = Wallet.fromPrivateKey(signingKey);

  const provider = await BakoProvider.authenticate(providerUrl, {
    token: 'your-token', // Replace with actual token logic
    challenge: 'your-challenge', // Replace with actual challenge logic
    address: wallet.address.toB256(),
  });

  const market = new Market(targetContractId, provider);

  const marketConfig: MarketConfig = JSON.parse(
    readFileSync(configPath, 'utf8')
  );

  // Fetch current collateral configurations
  const currentConfigurations = await market.functions
    .get_collateral_configurations()
    .call();

  for (const collateralAssetConfig of marketConfig.collateral_assets) {
    const assetId = collateralAssetConfig.asset_id;
    const existingConfig = currentConfigurations.find(
      (config) => config.asset_id === assetId
    );

    if (existingConfig) {
      if (
        JSON.stringify(existingConfig) !== JSON.stringify(collateralAssetConfig)
      ) {
        console.log(
          `Updating collateral asset configuration for asset_id: ${assetId}`
        );
        console.log(`Old configuration: ${JSON.stringify(existingConfig)}`);
        console.log(
          `New configuration: ${JSON.stringify(collateralAssetConfig)}`
        );
        // Assume user input is yes for simplicity
        await market.functions
          .update_collateral_asset(assetId, collateralAssetConfig)
          .call();
      } else {
        console.log(
          `Collateral asset configuration for asset_id: ${assetId} is already up-to-date`
        );
      }
    } else {
      console.log(
        `Adding collateral asset configuration for asset_id: ${assetId}`
      );
      console.log(`Configuration: ${JSON.stringify(collateralAssetConfig)}`);
      // Assume user input is yes for simplicity
      await market.functions.add_collateral_asset(collateralAssetConfig).call();
    }
  }

  // Verify updated configurations
  const updatedConfigurations = await market.functions
    .get_collateral_configurations()
    .call();
  console.log(
    `Collateral assets configurations: ${JSON.stringify(updatedConfigurations)}`
  );

  console.log('Collateral assets updated successfully');
};

main().catch((err) => {
  console.error('Error updating collateral assets:', err);
});
