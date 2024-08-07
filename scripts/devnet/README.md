# Run and develop on devnet

## Seed phrase for testing

practice vehicle bulb together group cost olive rely wasp mask soda olive

Account #0:

- private key: 0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc
- address: 2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8, fuel1995d8ht3mz630ld406phcsvutrm5q36yldguzmswpgkurzyjk8uq4l4w69

## Start devnet

``bash
./devnet.sh
``

## Deploy contracts (oracle, tokens, market)

``bash
./deploy_contracts.sh
``

Oracle contract = 0x1150bab9c165acb40e4cc9bf12d4225ff5c2815734495f88002d22c09e296188

Token factory contract = 0x8272199a6df6220ab4a5430656967dc66321af1509c2a0ffd39b62a73fdde9c5

Market contract = 0xe6ffabec7d624f362ab2ed0c9e2513a1d247e96dd315960600199abd5e2ab6d1

SWAY = 0x9a54a8d789c581c6f53358027a708c77f1fb37e66f9d746aefcc2cd6d6ecff5b
USDC = 0x6d1155ac4f08bcabb7bb4247a7325249263abbbf058a5db5fc0015a32c82dd0f
ETH  = 0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07
LINK = 0xcdc4d96249f5b7a9f502453930c6f44e57b93d160006a35718018561967331c7
BTC  = 0xec60e64c3f8857f288f7eed81c5699540a665c88a1657c18f2bbb48cf7d1490e
UNI  = 0x48da8f6980d24b97710b2a89666c90edd833f53747776ae1a58e7cc9b419b177
COMP = 0x48f792b7f7207bfff8d92f86a8fb5c61cff0cb100508953d99547716592faf74

## Mint some tokens

``bash
./mint_tokens.sh
``

## Start frontend

``bash
./start_frontend.sh
``

## Start oracle service

``bash
./start_oracle_service.sh
``

## Rebuilding ABIs

When rebuilding the ABIs using the ``rebuild_contracts.sh`` script, first set the swaylend folder path
