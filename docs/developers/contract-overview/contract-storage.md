---
description: >-
  Market Storage is a crucial component of our contract that serves as a central
  repository for all data related to the contract's mathematical operations.
---

# Contract storage

### config: Option\<MarketConfiguration> = Option::None

The `config` entity is used to store the market configuration for each individual market. It starts out as `None`, but you can initialize it by calling the `initialize` method and passing in an object of the `MarketConfiguration` type. This object contains information such as the addresses of the administrators who manage the market, the token that can be supplied and borrowed, and details about the pricing, interest rates, rewards, and more.&#x20;

#### The `MarketConfiguration` object has several fields, including:

* **`governor`** ([Address](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)): The address of the admin who can manage the market.
* **`pause_guardian`** ([Address](https://fuellabs.github.io/fuels-rs/v0.35.1/types/address.html)): The address of the admin who can pause the market.
* **`base_token`** ([ContractId](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)): The token that can be supplied and borrowed.
* **`base_token_decimals`** (u8): The decimal of the base token.
* **`base_token_price_feed`** ([ContractId](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)): The address of the price oracle contract where you can check the base token's market price in USD.
* **`kink`** (u64): The value that shows the optimal disposal.
* **`supply_per_second_interest_rate_slope_low`** (u64): The coefficient of dependence of the deposit rate on utilization every second if utilization is below optimal.
* **`supply_per_second_interest_rate_slope_high`** (u64): The coefficient of dependence of the deposit rate on utilization every second if utilization is higher than optimal.
* **`borrow_per_second_interest_rate_slope_low`** (u64): The coefficient of dependence of the loan rate on utilization every second if utilization is below optimal.
* **`borrow_per_second_interest_rate_slope_high`** (u64): The coefficient of dependence of the loan rate on utilization every second if utilization is higher than optimal.
* **`borrow_per_second_interest_rate_base`** (u64): The minimum monthly loan rate.
* _**`store_front_price_factor`**_ (u64): The share of the elimination of the penalty that the liquidator receives (and the rest remains on the score sheet as a protective reserve).
* **`base_tracking_supply_speed`** (u64): The amount of rewards (liquidity mining) we accrue per second for the entire supply.
* **`base_tracking_borrow_speed`** (u64): The amount of rewards (liquidity mining) we charge per second for the entire borrow.
* **`base_min_for_rewards`** (u64): The minimum amount at which rewards are accrued, with the same decimal as the base asset.
* **`base_borrow_min`** (u64): The minimal value of the base borrow amount, with the same decimal as the base asset.
* **`target_reserves`** (u64): The maximum number of protective reserves at which the sale of collateral occurs during liquidation.
* **`reward_token`** ([ContractId](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)): The address of the token that is used to pay mining rewards.
* **`asset_configs`** (Vec<[AssetConfig](contract-storage.md#the-assetconfig-object-has-several-fields-including)>): A vector value that contains the configuration of collateral assets.

#### The `AssetConfig` object has several fields, including:

AssetConfig is used to store the configuration values for each individual collateral token in the market. It contains the following fields:

* **`asset`** ([ContractId](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)): The address of the token that can be used as collateral.
* **`price_feed`** ([ContractId](https://fuellabs.github.io/fuels-rs/v0.35.1/types/contract-id.html)): The address of the price oracle contract where you can check the token's market price in USD.
* **`decimals`** (u8): The decimal of the token.
* **`borrow_collateral_factor`** (u64): The amount you can borrow relative to the dollar value of the collateral asset.
* **`liquidate_collateral_factor`** (u64): The ratio of the dollar value of the underlying asset to the dollar value of the collateral asset at which the debt will be liquidated.
* **`liquidation_penalty`** (u64): The amount of collateral that will be retained upon liquidation.
* **`supply_cap`** (u64): The maximum number of supply tokens per protocol.

### totals\_collateral: StorageMap\<ContractId, u64>

### user\_collateral: StorageMap<(Address, ContractId), u64>

### user\_basic: StorageMap\<Address, UserBasic>

user\_basic is a map where each key is a user's address and each value is an object that holds information about the user's basic details in the market. The user's basic details include:

* **`principal`** (i64): the user's balance at the time of market initialization, which can be used to calculate the current supply balance by multiplying it with sRate / bRate.
* **`base_tracking_index`** (u64): this value determines how much rewards the user is eligible to receive.
* **`base_tracking_accrued`** (u64): the total rewards accrued for the user.
* **`reward_claimed`** (u64): the total rewards that have been claimed by the user.

### market\_basic: MarketBasics

The `market_basic` value has the following fields:

* **`base_supply_index`** (u64): the supply rate
* **`base_borrow_index`** (u64): the borrowing rate
* **`tracking_supply_index`** (u64): the supply rate for rewards
* **`tracking_borrow_index`** (u64): the borrowing rate for rewards
* **`total_supply_base`** (u64): the total supply of the underlying asset in the market
* **`total_borrow_base`** (u64): the total borrow of the underlying asset in the market
* **`last_accrual_time`** (u64): the last time when rewards were accrued.

### pause\_config: Option \<PauseConfiguration>

The pause\_config value has the following fields:

* **`supply_paused`** (bool)
* **`withdraw_paused`** (bool)
* **`absorb_paused`** (bool)
* **`buy_pause`** (bool)
* **`claim_paused`** (bool)\


Each field in the `PauseConfiguration` struct represents whether a particular contract action (supply, withdraw, absorb, buy, or claim) is currently paused or not.

