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

### Smart contracts

#### Deploy market contract with proxy

Market contract is deploy with the proxy (proxy contract + loader contract with 2 blobs because market contract is bigger than 100 KB). The owner of the proxy contract is the deployer. You have to run this command in the CLI.

```bash
cd ../contracts/market && forc deploy                                  && cd ../../scripts # mainnet
cd ../contracts/market && forc deploy --testnet                        && cd ../../scripts # testnet
cd ../contracts/market && forc deploy --node-url http://127.0.0.1:4000 && cd ../../scripts # devnet
```

In the output you can see proxy contract id (proxy contract) and target contract id (loader contract). Add them to the `.env`.

**Note:** This command will add proxy address in the `Forc.toml` in the `../contracts/market` folder. Make sure the address is not wrriten in ``Forc.toml`` when deploying the contracts again.

#### Activate market contract

This script will activate the contract - setup the market configuration, owner of the market contract, and Pyth contract id.

```bash
cargo run --bin activate_market -- --config-path ./configs/testnet_usdc_config.json
```

#### Upgrade market contract

#### Change proxy owner

#### Change market owner

### Market

#### Update market configuration

#### Pause market

#### Unpause market

#### Withdraw reserves

#### Change Pyth contract

### Collateral assets

#### Add collateral asset

#### Pause collateral asset

#### Unpause collateral asset

#### Update collateral configuration

### Testnet-specific scripts

#### Deploy tokens contract

#### Deploy Pyth contract

#### Mint various tokens

#### Bootstrap collateral assets on the market contract

### Deploying contracts

### Activating market

###

### Testnet

### Testnet

### Testnet

## Deploying contracts (with proxy)

The following command will do the following:

- deploy proxy contract (owner of the proxy will be the deployer)
- deploy loader contract (which loads multiple blobs since our contract is bigger than 100 KB)

```bash
forc deploy 
forc deploy --testnet
```

Address of the proxy will be added to the ``Forc.toml``.

## Activating contracts

Next we need to call the function ``activate_contract`` on the market contract:

``bash
SIGNING_KEY=<SIGNING_KEY> cargo run --bin activate_market -- --proxy-contract-id <PROXY_CONTRACT_ADDRESS> --target-contract-id <TARGET_CONTRACT_ADDRESS>
``

## Upgrading contracts (with proxy)

This deploys the new market contract (loader/implementation contract) and updates the proxy contract to point to the new market contract:

TODO

## Change proxy owner

TODO

## Pausing contracts

TODO

## Unpausing contracts

TODO

## Adding collateral assets

TODO

## Changing market configuration

TODO

## Changing collateral configuration

TODO
