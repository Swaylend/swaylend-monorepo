use fuels::macros::abigen;

abigen!(Contract(
    name = "FlashLoanContract",
    abi = "contracts/flash_loan/out/release/flash-loan-abi.json"
));
