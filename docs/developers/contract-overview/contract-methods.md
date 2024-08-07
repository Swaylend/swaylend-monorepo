---
description: >-
  Below are brief descriptions of all the important functions used in our smart
  contract. For implementation details, please refer to our GitHub repository.
---

# Contract methods

* **`fn initialize(config: MarketConfiguration)`** has write permission to contract storage. Accepts an object with the MarketConfiguration type as argument. Initiates the market and sets the config, you can only call it once.
* **`fn pause(config: PauseConfiguration)`** has write and read permission to contract storage. Accepts an object with the PauseConfiguration type as argument. Suspends the list of methods (for example, withdraw, supply, etc.)
* **`fn get_configuration -> MarketConfiguration`** has write and read permission to contract storage. Accepts an object with the MarketConfiguration type as argument. Returns the current config.
* **fn get\_oracle\_price(asset:** [**ContractId**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)**) -> u64** has read permission to contract storage. Accepts an asset object as argument. Returns the market price of an asset.
* **`fn get_utilization() -> u64`** has read permission to contract storage. Doesn't accept an argument. Returns utilization of the market.
* **`fn get_supply_rate(utilization: u64) -> u64`** has read permission to contract storage. Accepts a utilization value as argument. Returns the deposit rate accrued per second.
* **`fn get_borrow_rate(utilization: u64) -> u64`** has read permission to contract storage. Accepts a utilization value as argument. Returns the loan rate accrued per second.
* **`fn is_liquidatable(account:`** [**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`) -> bool`**` ``` has read permission to contract storage. Accepts an address account as argument. Returns a boolean whether the account is subject to liquidation.
* **`fn get_collateral_reserves(asset:`** [**`ContractId`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)**`) -> I128` ** has read permission to contract storage. Accepts an asset address as argument. Returns asset collateral reserves.
* **`fn get_reserves() -> I128`**` ``` has read permission to contract storage. Doesn't accept an argument. Returns the reserves of the base asset.
* **`fn withdraw_reserves(to:`** [**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`, amount: u64)`** has read permission to contract storage. Accepts an account address and amount as arguments. Withdraws the reserves of the underlying asset.
* **`fn quote_collateral(asset:`** [**`ContractId`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)**`, base_amount: u64) -> u64`** has read permission to contract storage. Accepts an asset to be liquidated and minimal to receive amount values as arguments. Returns how many collateral tokens the liquidator will receive for the number of asset base tokens entered.
* **`fn absorb(accounts: Vec<`**[**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`>)`** has read and write permissions to contract storage. Accepts account addresses that should be absorbed as arguments. Transfers pledge and debt of underwater accounts to protocol balance.
* **`fn buy_collateral(asset:`** [**`ContractId`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)**`, min_amount: u64, recipient:`** [**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`)`** has read permission to contract storage. Buys collateral for liquidated accounts from the protocol.
* **`fn supply_collateral(dst:`** [**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`)`** has read and write permissions to contract storage. Deposit of collateral.
* **`fn withdraw_collateral(asset:`** [**`ContractId`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)**`, amount: u64)` ** has read and write permissions to contract storage. Withdrawal of collateral token.
* **`fn supply_base()`** has read and write permissions to contract storage. Deposit the base asset.
* **`fn withdraw_base()`** has read and write permissions to contract storage. Withdrawal of base token.
* **`fn withdraw_reward_token(to:`** [**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`, amount: u64)`** has read and write permissions to contract storage. Accepts utilization value as an argument. Claims a reward token from the protocol (function for the admin).
* **`fn get_reward_owed(account:`** [**`Address`**](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)**`) -> u64`** has read permission to contract storage. Accepts an account address as an argument. Returns the rewards accrued to the user since the last
