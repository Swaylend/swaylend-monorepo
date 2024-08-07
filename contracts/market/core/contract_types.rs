use fuels::macros::abigen;

abigen!(Contract(
    name = "Market",
    abi = "contracts/market/out/release/market-abi.json"
));
