library;

pub mod structs;

use structs::*;

abi Rewards {
    // Get version of the smart contract
    fn get_version() -> u8;

    // # 0. Activate contract
    #[storage(write)]
    fn activate_contract(owner: Identity);

    // # 1. Set the reward configs to rewardConfig for specific market instance
    #[storage(write)]
    fn set_reward_config_with_multiplier(market: ContractId, token: AssetId, multiplier: u256);

    // # 2. Set the reward token for a swaylend market instance
    #[storage(write)]
    fn set_reward_config(market: ContractId, token: AssetId);

    // # 3. Set the rewards claimed for a list of users - this is for management only
    //      the rewards claimed are updated in claimInternal function
    #[storage(write)]
    fn set_rewards_claimed(market: ContractId, users: Vec<Identity>, claimed_amounts: Vec<u256>);

    // # 4. Withdraw tokens from the contract
    #[storage(read)]
    fn withdraw_token(token: AssetId, to: Identity, amount: u256);

    // # 5. Transfers the governor rights to a new address
    #[storage(write)]
    fn transfer_governor(new_governor: Identity);

    // # 6. Calculates the amount of a reward token owed to an account
    #[storage(read)]
    fn get_reward_owed(market: ContractId, account: Identity) -> RewardOwed;

    // # 7. Claim rewards of token type from a swaylend market instance to owner address
    //      This one calls internal claimInternal
    #[storage(read, write)]
    fn claim(market: ContractId, src: Identity, should_accrue: bool);

    // # 8. Claim rewards of token type from a swaylend market instance to a target address
    #[storage(read, write)]
    fn claim_to(market: ContractId, src: Identity, to: Identity, should_accrue: bool);

    // # 9. Set ownership to zero address
    #[storage(write)]
    fn renounce_ownership();
}
