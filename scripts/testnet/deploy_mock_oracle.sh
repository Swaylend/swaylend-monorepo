#!/bin/sh

cd ../../contracts/pyth-mock
SECRET=0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc RPC=https://testnet.fuel.network/v1/graphql cargo test --release scripts::deploy::deploy -- --nocapture
