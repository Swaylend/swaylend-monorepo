#!/bin/bash

SIGNING_KEY=0xde97d8624a438121b86a1956544bd72ed68cd69f2c99555b08b1e8c51ffd511c
PROVIDER_URL=http://localhost:4000/v1/graphql
NETWORK=devnet

TOKEN_CONTRACT_ID="0xf8895b6a0361548e6493da30d0a68661b99c44f84ff3b5a2c51fe1ae8d5d0a44"
SRC_20_CONTRACT_ID="0x7b1345c8aaa5aeec29f52da3ba4038ce154d4f6ddcf6691c431463fa3bf30477"
PYTH_MOCK_CONTRACT_ID="0xfb38fd890d8f4b2482a807e32a9eec7a152713c0cbb6d0c9af1ef884ea4e6cbf"

# Market deployed on devnet
MARKET_TARGET_CONTRACT_ID="0x69de6c52b2539d652c8b4f30a88baad8aef05c3cb534e125cf439b89c975dc10"
MARKET_PROXY_CONTRACT_ID="0x1a28ebb545dc8ca32bf84fda133c28c784ef54a4572f0491760fb56496df8e4c"

read -p "Have you deleted proxy address from contracts/market/Forc.toml? (y/n): " answer
if [ "$answer" != "y" ]; then
    echo "Please delete the proxy address from contracts/market/Forc.toml before continuing."
    exit 1
fi

cd ../../
forc deploy --default-signer --node-url http://localhost:4000/v1/graphql \
    --salt market:0x0000000000000000000000000000000000000000000000000000000000000001 \
    --salt token:0x0000000000000000000000000000000000000000000000000000000000000002 \
    --salt pyth-mock:0x0000000000000000000000000000000000000000000000000000000000000003 \
    --salt src-20:0x000000000000000000000000000000000000000000000000000000000000000

cd ./scripts

# configure with test tokens
cargo run --release --bin mint_tokens -- --config-path ./configs/devnet_usdc_mock_config.json \
    --token-contract-id $TOKEN_CONTRACT_ID \
    --provider-url $PROVIDER_URL \
    --network $NETWORK \
    --signing-key $SIGNING_KEY \
    --market-target-contract-id $MARKET_TARGET_CONTRACT_ID \
    --market-proxy-contract-id $MARKET_PROXY_CONTRACT_ID \
    --recipient address:0x0000000000000000000000000000000000000000000000000000000000000000 --amount 10000000000

# activate market
cargo run --release --bin activate_market -- --config-path ./configs/devnet_usdc_mock_config.json \
    --provider-url $PROVIDER_URL \
    --network $NETWORK \
    --signing-key $SIGNING_KEY \
    --market-target-contract-id $MARKET_TARGET_CONTRACT_ID \
    --market-proxy-contract-id $MARKET_PROXY_CONTRACT_ID

# add collaterals
cargo run --release --bin update_collateral_assets -- --config-path ./configs/devnet_usdc_mock_config.json \
    --provider-url $PROVIDER_URL \
    --network $NETWORK \
    --signing-key $SIGNING_KEY \
    --market-target-contract-id $MARKET_TARGET_CONTRACT_ID \
    --market-proxy-contract-id $MARKET_PROXY_CONTRACT_ID
