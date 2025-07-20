use fuels::macros::abigen;

abigen!(Contract(
    name = "RedstonePrices",
    abi = "contracts/redstone-prices/out/release/redstone_prices-abi.json"
));
