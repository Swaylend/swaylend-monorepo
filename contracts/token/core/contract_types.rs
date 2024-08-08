use fuels::macros::abigen;

abigen!(Contract(
    name = "Token",
    abi = "contracts/token/out/release/token-abi.json",
));
