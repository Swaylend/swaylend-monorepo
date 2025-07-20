use fuels::macros::abigen;

abigen!(Contract(
    name = "PythMock",
    abi = "contracts/pyth-mock/out/release/pyth_mock-abi.json"
));
