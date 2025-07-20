use fuels::macros::abigen;

abigen!(Contract(
    name = "RedstonePricesMock",
    abi = "contracts/redstone-prices-mock/out/release/redstone_prices_mock-abi.json"
));
