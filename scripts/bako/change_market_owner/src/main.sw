script;

use market_abi::Market;

configurable {
    MARKET_CONTRACT_ID: ContractId = ContractId::zero(),
}


fn main(new_owner: Identity) {
    let market = abi(Market, MARKET_CONTRACT_ID.into());
    market.transfer_ownership(new_owner);
}