# SwayLend Protocol Contracts

The core components of the SwayLend protocol are located here. The protocol implementation resides in [`main.sw`](src/main.sw).

## Building contracts

To build the contracts, run the following commands in the project root:

```bash
forc build
forc build --release
```

## Testing contracts

We use the release build for our tests. To run the tests, execute:

```bash
cargo test --release local_tests -- --nocapture
```

If you don't want to see all the standard output and only want to see the test results, omit the `--nocapture` flag from the command above.

## Deploying contracts (with proxy)

The following command will do the following:

- deploy proxy contract (owner of the proxy will be the deployer)
- deploy loader contract (which loads multiple blobs since our contract is bigger than 100 KB)

```bash
forc deploy 
forc deploy --testnet
```

Address of the proxy will be added to the ``Forc.toml``.

**Note:** Make sure the address is not wrriten in ``Forc.toml`` when deploying the contracts.

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
