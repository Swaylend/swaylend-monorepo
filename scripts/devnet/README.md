# Run and develop on devnet

## Seed phrase for testing

practice vehicle bulb together group cost olive rely wasp mask soda olive

Account #0:

* private key: 0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc
* address: 2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8, fuel1995d8ht3mz630ld406phcsvutrm5q36yldguzmswpgkurzyjk8uq4l4w69

## Start devnet

``bash
./run.sh
``

## Deploy contracts (oracle, tokens, market)

This will deploy the pyth mock oracle, tokens, mint tokens, and deploy the market contract along with activation and collateral configs.

``bash
./setup-devnet.sh
``

* Token factory contract: `0xab0dc5c65212c0d062101b986e18a251f15317c934c1196ccf78fa761eecb394`
* Pyth mock oracle: `0xd162dfc8b22cedc427afe8e88640520cb1828627633085beed8e0c78442ba428`
* Loader contract: `0x19fb90cd10df6c35056d4f20c1dccc235afed70b5f285f7cb19948f6cb3b1ea0` (this is basically the main logic contract)
* Proxy contract: `0x4f1814444f2e995803d88179476421f04f774b5c4c40956b0655b1e62b1c695d`

Tokens: 
* ETH: `f8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07`
* USDC: `0xdb012cf2f31dcb9b46ed0ef619abe040db24172deb8f7c1ef573097b2225d8b6`
* BTC: `0x50ec3fd9d54db44697b4613b2b6d6f16df5b9f8e3e7a6fba3c51896cfaeec3a7`
* UNI: `0x2cc3e9fa1a1009342165b57d375790f91959346a6558f9bceb378a31bd4ca992`

> Also deploys src-20 on 0x02a2e4643e3a8c41ab7aa39a29ea60142a8e1d857775ae116ce60a4eeb9039e8, for now useless.
