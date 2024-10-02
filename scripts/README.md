## Scripts for deployments

This folder contains all scrips and necessary files for deployments of Swaylend on mainnet, testnet, and devnet.

If you are interested in testing on local devnet, checkout the `devnet` folder.

## Scripts

Before we begin, you need to do a few things:

- Setup a `forc-wallet`. Make sure to export a private key, since you're going to need it.
- Rename `env.example` to `.env`.
- Add signing key, provider url, and network (mainnet, testnet, devnet) to the `.env`.
- If you already have deployed contract, add proxy contract id and target contract id as well (otherwise deploy contracts first and add it then).

Below, we have all the necessary scripts for operations on the mainnet. If you're testing on testnet/devnet, make sure to check the testnet scripts in the end as well.

### Deploy market contract with proxy

Market contract is deploy with the proxy (proxy contract + loader contract with 2 blobs because market contract is bigger than 100 KB). The owner of the proxy contract is the deployer. You have to run this command in the CLI.

```bash
cd ../contracts/market && forc deploy                                  && cd ../../scripts # mainnet
cd ../contracts/market && forc deploy --testnet                        && cd ../../scripts # testnet
cd ../contracts/market && /home/vid/Documents/Company/fuel/sway/target/debug/forc-deploy --node-url http://127.0.0.1:4000 && cd ../../scripts # devnet
```

In the output you can see proxy contract id (proxy contract) and target contract id (loader contract). Add them to the `.env`.

**Note:** This command will add proxy address in the `Forc.toml` in the `../contracts/market` folder. Make sure the address is not wrriten in ``Forc.toml`` when deploying the contracts again.

### Activate market contract

This script will activate the contract - setup the market configuration, owner of the market contract, and Pyth contract id.

```bash
cargo run --bin activate_market -- --config-path ./configs/testnet_usdc_config.json
```

### Update collateral assets

This script will update the collateral asset configuration (add new collateral assets, pause collateral assets, unpause collateral assets, update collateral asset configuration ...).

```bash
cargo run --bin update_collateral_assets -- --config-path ./configs/testnet_usdc_config.json
```

### Upgrade market contract

TODO

### Change proxy owner

This script will change proxy owner.

```bash
cargo run --bin change_proxy_owner -- --new-owner contract:0x546403add23accc66d96e853245db1398fb8d0ffbea184395f04ae3d26fd516f
```

### Change market owner

This script will change market owner.

```bash
cargo run --bin change_market_owner -- --new-owner address:0x2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8
```

### Update market configuration

TODO

### Withdraw reserves

TODO

### Testnet: deploy tokens contract

This script will deploy customm tokens contract.

```bash
cargo run --bin deploy_tokens
```

### Testnet: deploy Pyth oracle contract

This script will deploy Pyth mock oracle contract.

```bash
cargo run --bin deploy_pyth
```

### Testnet: mint tokens

This script will mint tokens provided in the config file (base asset and collateral assets).

```bash
cargo run --bin mint_tokens -- --config-path ./configs/testnet_usdc_config.json --token-contract-id 0xa6447a4d4a1588a6a97f440af5ece9551fc16d41c3f6360a45affe24eaaf9c06 --recipient 0x2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8 --amount 100000
```
