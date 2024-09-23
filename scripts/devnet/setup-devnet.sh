#!/bin/bash

# deploys to
# token: 0xab0dc5c65212c0d062101b986e18a251f15317c934c1196ccf78fa761eecb394
# src-20: 0x02a2e4643e3a8c41ab7aa39a29ea60142a8e1d857775ae116ce60a4eeb9039e8
# pyth_mock: 0x51b52248d0f329f2e2de63932d1bc9b72c66539c69766ec84c2478766d89857f
# loader contract: 0x5e562f51f507b4c784b3c7673c4dbfeeb461d3318099812db7347f45dd1f8d8a
# proxy contract: 0x5f74026efe43632d3be4659a91904270ed539ffbd140d38b0435747945c3646a

# USDC: 0xdb012cf2f31dcb9b46ed0ef619abe040db24172deb8f7c1ef573097b2225d8b6
# BTC: 0x50ec3fd9d54db44697b4613b2b6d6f16df5b9f8e3e7a6fba3c51896cfaeec3a7
# UNI: 0x2cc3e9fa1a1009342165b57d375790f91959346a6558f9bceb378a31bd4ca992

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

# deploy tokens
cargo run --bin configure_tokens -- --signing-key $SIGNING_KEY \
    --token-contract-id 0xab0dc5c65212c0d062101b986e18a251f15317c934c1196ccf78fa761eecb394

# mint tokens
cargo run --bin mint_tokens -- --signing-key $SIGNING_KEY \
    --token-contract-id 0xab0dc5c65212c0d062101b986e18a251f15317c934c1196ccf78fa761eecb394

# activate market
cargo run --bin activate_market -- --signing-key $SIGNING_KEY \
    --proxy-contract-id 0x5f74026efe43632d3be4659a91904270ed539ffbd140d38b0435747945c3646a \
    --target-contract-id 0x5e562f51f507b4c784b3c7673c4dbfeeb461d3318099812db7347f45dd1f8d8a \
    --oracle-contract-id 0x51b52248d0f329f2e2de63932d1bc9b72c66539c69766ec84c2478766d89857f \
    --base-token-id 0xdb012cf2f31dcb9b46ed0ef619abe040db24172deb8f7c1ef573097b2225d8b6 \
    --base-token-price-feed 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a
