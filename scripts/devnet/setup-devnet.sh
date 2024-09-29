#!/bin/bash

# deploys to those addresses on local devnet
TOKEN_CONTRACT_ID="0xab0dc5c65212c0d062101b986e18a251f15317c934c1196ccf78fa761eecb394"
SRC_20_CONTRACT_ID="0x2442977986968c3091c0b5bc5cabf20c4dffaa57f2dc7d2a90caf8d91fd41825"
ORACLE_CONTRACT_ID="0xd162dfc8b22cedc427afe8e88640520cb1828627633085beed8e0c78442ba428"
TARGET_CONTRACT_ID="0x19fb90cd10df6c35056d4f20c1dccc235afed70b5f285f7cb19948f6cb3b1ea0"
PROXY_CONTRACT_ID="0x4f1814444f2e995803d88179476421f04f774b5c4c40956b0655b1e62b1c695d"
BASE_TOKEN_PRICE_FEED="0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"

USDC_CONTRACT_ID="0xdb012cf2f31dcb9b46ed0ef619abe040db24172deb8f7c1ef573097b2225d8b6"
BTC_CONTRACT_ID="0x50ec3fd9d54db44697b4613b2b6d6f16df5b9f8e3e7a6fba3c51896cfaeec3a7"
UNI_CONTRACT_ID="0x2cc3e9fa1a1009342165b57d375790f91959346a6558f9bceb378a31bd4ca992"

read -p "Have you deleted proxy address from contracts/market/Forc.toml? (y/n): " answer
if [ "$answer" != "y" ]; then
    echo "Please delete the proxy address from contracts/market/Forc.toml before continuing."
    exit 1
fi

cd ../../
forc deploy --node-url http://localhost:4000 \
    --salt market:0x0000000000000000000000000000000000000000000000000000000000000001 \
    --salt token:0x0000000000000000000000000000000000000000000000000000000000000002 \
    --salt pyth-mock:0x0000000000000000000000000000000000000000000000000000000000000003 \
    --salt src-20:0x0000000000000000000000000000000000000000000000000000000000000004

# configure with test tokens
cargo run --bin configure_tokens -- --signing-key $SIGNING_KEY \
    --token-contract-id $TOKEN_CONTRACT_ID

# mint tokens
cargo run --bin mint_tokens -- --signing-key $SIGNING_KEY \
    --token-contract-id $TOKEN_CONTRACT_ID

# activate market
cargo run --bin activate_market -- --signing-key $SIGNING_KEY \
    --proxy-contract-id $PROXY_CONTRACT_ID \
    --target-contract-id $TARGET_CONTRACT_ID \
    --oracle-contract-id $ORACLE_CONTRACT_ID \
    --base-token-id $USDC_CONTRACT_ID \
    --base-token-price-feed $BASE_TOKEN_PRICE_FEED

# bootstrap collateral
cargo run --bin bootstrap_collateral -- --signing-key $SIGNING_KEY \
    --token-contract-id $TOKEN_CONTRACT_ID \
    --target-contract-id $TARGET_CONTRACT_ID
