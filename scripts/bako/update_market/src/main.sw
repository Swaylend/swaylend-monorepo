script;

use market_abi::Market;
use market_abi::structs::{MarketConfiguration, PauseConfiguration};

configurable {
    MARKET_CONTRACT_ID: ContractId = ContractId::zero(),
}

fn main(
    config: MarketConfiguration,
    pyth_id: ContractId,
    pause_config: PauseConfiguration,
) {
    let market = abi(Market, MARKET_CONTRACT_ID.into());
    market.update_market_configuration(config);
    let curr_pyth = market.get_pyth_contract_id();
    let curr_pause = market.get_pause_configuration();
    if curr_pyth != pyth_id {
        market.set_pyth_contract_id(pyth_id);
    }

    if curr_pause.absorb_paused != pause_config.absorb_paused
        || curr_pause.buy_paused != pause_config.buy_paused
        || curr_pause.supply_paused != pause_config.supply_paused
        || curr_pause.withdraw_paused != pause_config.withdraw_paused
    {
        market.pause(pause_config);
    }
}
