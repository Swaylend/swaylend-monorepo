#!/bin/bash

# deploys to those addresses on local devnet
TOKEN_CONTRACT_ID="0xad56293ee3dc2ce81005d33c95ecbeb1549dbfb1adb242b81090dba390241067"
SRC_20_CONTRACT_ID="0xbfc6b400716e93736953f1fdf956300e036abdaf2b41fb30e70fb813b87d4c34"
ORACLE_CONTRACT_ID="0xc7b7ba72307fd1681017a6ed2e958629a87a2e48cb32dc2ed0e783918398c588"
TARGET_CONTRACT_ID="0x42fccc9904373da253b186c515ab52337128947a7f5a6f2916c92ea821320047"
PROXY_CONTRACT_ID="0x42fccc9904373da253b186c515ab52337128947a7f5a6f2916c92ea821320047"
BASE_TOKEN_PRICE_FEED="0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"

USDC_CONTRACT_ID="0xc75cf050b2b7495f504f7dc30a7aa45230e0373116fe0566bc44e2c84595f414"
BTC_CONTRACT_ID="0x8bd21c9d6d1b342e651ad7da95220d5741cd4583234c6b1b99e5c245db69263a"
UNI_CONTRACT_ID="0x69c6de7ebf99efd3ab5af9289a45fd9626ccbb61b012b35853b91c2287529fd2"

# read -p "Have you deleted proxy address from contracts/market/Forc.toml? (y/n): " answer
# if [ "$answer" != "y" ]; then
#     echo "Please delete the proxy address from contracts/market/Forc.toml before continuing."
#     exit 1
# fi

cd ../../
forc deploy --node-url http://localhost:4000/v1/graphql \
    --salt market:0x0000000000000000000000000000000000000000000000000000000000000001 \
    --salt token:0x0000000000000000000000000000000000000000000000000000000000000002 \
    --salt pyth-mock:0x0000000000000000000000000000000000000000000000000000000000000003 \
    --salt src-20:0x0000000000000000000000000000000000000000000000000000000000000004

cd ./scripts
# configure with test tokens
cargo run --bin mint_tokens -- --config-path ./configs/devnet_usdc_mock_config.json \
    --token-contract-id 0xad56293ee3dc2ce81005d33c95ecbeb1549dbfb1adb242b81090dba390241067 \
    --recipient address:0x0000000000000000000000000000000000000000000000000000000000000000 --amount 10000000000

# activate market
cargo run --bin activate_market -- --config-path ./configs/devnet_usdc_mock_config.json

# add collaterals
cargo run --bin update_collateral_assets -- --config-path ./configs/devnet_usdc_mock_config.json
