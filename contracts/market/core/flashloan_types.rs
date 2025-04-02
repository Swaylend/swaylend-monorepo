use fuels::macros::abigen;

abigen!(Script(
    name = "FlashLoanScript",
    abi = "contracts/flash-loan/out/release/flash-loan-abi.json"
));
