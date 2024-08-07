#!/bin/sh

# deploy oracle

cd ../../contracts/oracle
SECRET=0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc RPC=http://127.0.0.1:4000 RANDOM=false cargo test deploy -- --nocapture

# deploy tokens and market

cd ../market
SECRET=0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc RPC=http://127.0.0.1:4000 ORACLE_ADDRESS=1150bab9c165acb40e4cc9bf12d4225ff5c2815734495f88002d22c09e296188 TOKEN_CONTRACT_ADDRESS=8272199a6df6220ab4a5430656967dc66321af1509c2a0ffd39b62a73fdde9c5 RANDOM=false cargo test scripts::deploy::deploy -- --nocapture
