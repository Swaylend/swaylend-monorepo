#!/bin/bash

TOKEN_CONTRACT_ADDRESS=$1

cd ../../contracts/market
SECRET=0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc RPC=https://testnet.fuel.network/v1/graphql TOKEN_CONTRACT_ADDRESS=$TOKEN_CONTRACT_ADDRESS cargo test --release mint_tokens -- --nocapture