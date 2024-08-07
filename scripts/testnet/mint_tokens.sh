#!/bin/bash

ORACLE_ADDRESS=$1
TOKEN_CONTRACT_ADDRESS=$2

cd ../../contracts/market
SECRET=0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc TOKEN_CONTRACT_ADDRESS=$TOKEN_CONTRACT_ADDRESS ORACLE_ADDRESS=$ORACLE_ADDRESS RPC=https://testnet.fuel.network/v1/graphql cargo test mint_tokens -- --nocapture