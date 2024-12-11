script;

use market_abi::Market;
use market_abi::structs::CollateralConfiguration;

configurable {
    MARKET_CONTRACT_ID: ContractId = ContractId::zero(),
}


fn main(to_update: Vec<CollateralConfiguration>, to_add: Vec<CollateralConfiguration>) {
    require(
        !to_update.is_empty() || !to_add.is_empty(),
        "At least one of the arguments must contain collateral assets."
    );
    let market = abi(Market, MARKET_CONTRACT_ID.into());

    for collateral in to_update.iter() {
        market.update_collateral_asset(collateral.asset_id, collateral);
    }

    for collateral in to_add.iter() {
        market.add_collateral_asset(collateral);
    }
}