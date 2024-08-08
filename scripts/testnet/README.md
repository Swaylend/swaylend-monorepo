# Run and develop on devnet

## Seed phrase for testing

practice vehicle bulb together group cost olive rely wasp mask soda olive

Account #0:

- private key: 0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc
- address: 2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8, fuel1995d8ht3mz630ld406phcsvutrm5q36yldguzmswpgkurzyjk8uq4l4w69

## Deploy contracts (tokens, market)

``bash
./deploy_tokens.sh
``

Insert the oracle and tokens address in the script below after deploying oracle and tokens smart contract on the testnet.

``bash
./deploy_market.sh <oracle address> <tokens address>
``

## Mint tokens

Insert tokens address in the script below after deploying tokens smart contract on the testnet.

``bash
./mint_tokens.sh <tokens address>
``

## Start frontend

``bash
./start_frontend.sh
``

## Start oracle service

Insert the oracle address in the script below after deploying oracle smart contract on the testnet.

``bash
./start_oracle.sh <oracle address>
``
