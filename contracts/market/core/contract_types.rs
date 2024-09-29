use fuels::macros::abigen;

abigen!(Contract(
    name = "MarketContract",
    abi = "contracts/market/out/release/market-abi.json"
));
