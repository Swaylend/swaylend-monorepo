script;

use market_abi::Market;

configurable {
    MARKET_CONTRACT_ID: ContractId = ContractId::zero(),
}

fn main(to: Identity, amount: u64) {
    let market = abi(Market, MARKET_CONTRACT_ID.into());
    market.withdraw_reserves(to, amount);
}
