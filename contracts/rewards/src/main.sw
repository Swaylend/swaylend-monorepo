// SPDX-License-Identifier: MIT

contract;

//
// @title Swaylend's Market Contract
// @notice An efficient monolithic money market protocol
// @author Reserve Labs LTD
//

mod events;

use events::*;
use market_abi::{Market, structs::*,};
use rewards_abi::{Rewards, structs::*,};
use standards::src5::{SRC5, State};
use sway_libs::ownership::*;

// version of the smart contract
const VERSION: u8 = 1_u8;

impl Rewards for Contract {
    // Get version of the smart contract
    fn get_version() -> u8 {
        VERSION
    }

    // # 0. Activate contract
    #[storage(write)]
    fn activate_contract(owner: Identity) {
        initialize_ownership(owner);
    }

    // # 1. Set the reward configs to rewardConfig for specific market instance
    #[storage(write)]
    fn set_reward_config_with_multiplier(market: ContractId, token: AssetId, multiplier: u256) {}

    // # 2. Set the reward token for a swaylend market instance
    #[storage(write)]
    fn set_reward_config(market: ContractId, token: AssetId) {}

    // # 3. Set the rewards claimed for a list of users - this is for management only
    //      the rewards claimed are updated in claimInternal function
    #[storage(write)]
    fn set_rewards_claimed(market: ContractId, users: Vec<Identity>, claimed_amounts: Vec<u256>) {}

    // # 4. Withdraw tokens from the contract
    #[storage(read)]
    fn withdraw_token(token: AssetId, to: Identity, amount: u256) {}

    // # 5. Transfers the governor rights to a new address
    #[storage(write)]
    fn transfer_governor(new_governor: Identity) {}

    // # 6. Calculates the amount of a reward token owed to an account
    #[storage(read)]
    fn get_reward_owed(market: ContractId, account: Identity) -> RewardOwed {
        RewardOwed::default()
    }

    // # 7. Claim rewards of token type from a swaylend market instance to owner address
    //      This one calls internal claimInternal
    #[storage(read, write)]
    fn claim(market: ContractId, src: Identity, should_accrue: bool) {}

    // # 8. Claim rewards of token type from a swaylend market instance to a target address
    #[storage(read, write)]
    fn claim_to(market: ContractId, src: Identity, to: Identity, should_accrue: bool) {}

    // # 9. Set ownership to zero address
    #[storage(write)]
    fn renounce_ownership() {}
}

impl SRC5 for Contract {
    #[storage(read)]
    fn owner() -> State {
        _owner()
    }
}

//  Claim to, assuming permitted
fn claim_internal(market: ContractId, src: Identity, to: Identity, should_accrue: bool) {}

//  Calculates the reward accrued for an account on a Comet deployment
fn get_reward_accrued(market: ContractId, account: Identity, config: RewardConfiguration) -> u256 {
    u256::zero()
}

//  Safe ERC20 transfer out
fn transfer_out(token: AssetId, to: Identity, amount: u256) {}
