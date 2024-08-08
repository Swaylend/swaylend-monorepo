#!/bin/sh

ORACLE_ADDRESS=$1
MARKET_ADDRESS=$2

cd ../../apps/oracle
SECRET=0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc RPC=https://testnet.fuel.network/v1/graphql ORACLE_ADDRESS=$ORACLE_ADDRESS MARKET_ADDRESS=$MARKET_ADDRESS cargo run
