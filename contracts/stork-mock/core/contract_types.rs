use fuels::macros::abigen;

abigen!(Contract(
    name = "StorkMock",
    abi = "contracts/stork-mock/out/release/stork_mock-abi.json"
));
