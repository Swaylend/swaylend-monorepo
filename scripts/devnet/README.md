# Run and develop on devnet

## Seed phrase for testing

practice vehicle bulb together group cost olive rely wasp mask soda olive

Account #0:

* private key: 0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc
* address: 2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8, fuel1995d8ht3mz630ld406phcsvutrm5q36yldguzmswpgkurzyjk8uq4l4w69

## Start devnet

``bash
./devnet.sh
``

## Deploy contracts (oracle, tokens, market)

This will deploy the pyth mock oracle, tokens, mint tokens, and deploy the market contract along with activation and collateral configs.

``bash
./setup-devnet.sh
``

* Token factory contract: `0xab0dc5c65212c0d062101b986e18a251f15317c934c1196ccf78fa761eecb394`
* Pyth mock oracle: `0x51b52248d0f329f2e2de63932d1bc9b72c66539c69766ec84c2478766d89857f`
* Loader contract: `0x5e562f51f507b4c784b3c7673c4dbfeeb461d3318099812db7347f45dd1f8d8a`
* Proxy contract: `0x5f74026efe43632d3be4659a91904270ed539ffbd140d38b0435747945c3646a`

Tokens: 
* ETH: `f8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07`
* USDC: `0xdb012cf2f31dcb9b46ed0ef619abe040db24172deb8f7c1ef573097b2225d8b6`
* BTC: `0x50ec3fd9d54db44697b4613b2b6d6f16df5b9f8e3e7a6fba3c51896cfaeec3a7`
* UNI: `0x2cc3e9fa1a1009342165b57d375790f91959346a6558f9bceb378a31bd4ca992`

> Also deploys src-20 on 0x02a2e4643e3a8c41ab7aa39a29ea60142a8e1d857775ae116ce60a4eeb9039e8, for now useless.

## Start frontend

``bash
./start_frontend.sh
``

## Start oracle service

``bash
./start_oracle_service.sh
``

## Rebuilding ABIs

When rebuilding the ABIs using the ` ` rebuild_contracts.sh ` ` script, first set the swaylend folder path
