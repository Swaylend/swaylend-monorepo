use crate::{convert_i256_to_i128, convert_u256_to_u128, format_units, format_units_u128};
use fuels::{
    accounts::{wallet::WalletUnlocked, ViewOnlyAccount},
    programs::{
        calls::{CallParameters, ContractDependency},
        contract::{Contract, LoadConfiguration, StorageConfiguration},
        responses::CallResponse,
    },
    types::{
        bech32::Bech32ContractId, transaction::TxPolicies,
        transaction_builders::VariableOutputPolicy, AssetId, Bits256, Bytes, Bytes32, ContractId,
        Identity,
    },
};
use market::*;
use rand::Rng;
use serde::Deserialize;
use std::path::PathBuf;
use token_sdk::Asset;

const DEFAULT_GAS_LIMIT: u64 = 2_000_000;

pub struct Market {
    pub instance: MarketContract<WalletUnlocked>,
}

#[derive(Deserialize)]
struct MarketConfig {
    supply_kink: u64,
    borrow_kink: u64,
    supply_per_second_interest_rate_slope_low: u64, // decimals: 18
    supply_per_second_interest_rate_slope_high: u64, // decimals: 18
    supply_per_second_interest_rate_base: u64,      // decimals: 18
    borrow_per_second_interest_rate_slope_low: u64, // decimals: 18
    borrow_per_second_interest_rate_slope_high: u64, // decimals: 18
    borrow_per_second_interest_rate_base: u64,      // decimals: 18
    store_front_price_factor: u64,                  // decimals: 4
    base_tracking_index_scale: u64,                 // decimals: 18
    base_tracking_supply_speed: u64,                // decimals: 18
    base_tracking_borrow_speed: u64,                // decimals: 18
    base_min_for_rewards: u64,                      // decimals base_token_decimals
    base_borrow_min: u64,                           // decimals base_token_decimals
    target_reserves: u64,
}

pub fn get_market_config(
    base_token: AssetId,
    base_token_decimals: u32,
    base_token_price_feed_id: Bits256,
) -> anyhow::Result<MarketConfiguration> {
    let config_json_path = PathBuf::from(env!("CARGO_WORKSPACE_DIR"))
        .join("contracts/market/tests/market-config.json");
    let config_json_str = std::fs::read_to_string(config_json_path)?;
    let config: MarketConfig = serde_json::from_str(&config_json_str)?;

    Ok(MarketConfiguration {
        base_token,
        base_token_decimals,
        base_token_price_feed_id,
        supply_kink: config.supply_kink.into(),
        borrow_kink: config.borrow_kink.into(),
        supply_per_second_interest_rate_slope_low: config
            .supply_per_second_interest_rate_slope_low
            .into(),
        supply_per_second_interest_rate_slope_high: config
            .supply_per_second_interest_rate_slope_high
            .into(),
        supply_per_second_interest_rate_base: config.supply_per_second_interest_rate_base.into(),
        borrow_per_second_interest_rate_slope_low: config
            .borrow_per_second_interest_rate_slope_low
            .into(),
        borrow_per_second_interest_rate_slope_high: config
            .borrow_per_second_interest_rate_slope_high
            .into(),
        borrow_per_second_interest_rate_base: config.borrow_per_second_interest_rate_base.into(),
        store_front_price_factor: config.store_front_price_factor.into(),
        base_tracking_index_scale: config.base_tracking_index_scale.into(),
        base_tracking_supply_speed: config.base_tracking_supply_speed.into(),
        base_tracking_borrow_speed: config.base_tracking_borrow_speed.into(),
        base_min_for_rewards: config.base_min_for_rewards.into(),
        base_borrow_min: config.base_borrow_min.into(),
        target_reserves: config.target_reserves.into(),
    })
}

impl Market {
    pub async fn deploy(
        wallet: &WalletUnlocked,
        debug_step: u64, // only for local test
        random_address: bool,
    ) -> anyhow::Result<Self> {
        let configurables = MarketContractConfigurables::default().with_DEBUG_STEP(debug_step)?;

        let root = PathBuf::from(env!("CARGO_WORKSPACE_DIR"));

        let storage_configuration = StorageConfiguration::default().add_slot_overrides_from_file(
            root.join("contracts/market/out/release/market-storage_slots.json"),
        )?;

        let config = LoadConfiguration::default()
            .with_storage_configuration(storage_configuration)
            .with_configurables(configurables);

        let id = if random_address {
            let mut rng = rand::thread_rng();
            let salt = rng.gen::<[u8; 32]>();

            Contract::load_from("./out/release/market.bin", config)?
                .with_salt(salt)
                .deploy(wallet, TxPolicies::default())
                .await?
        } else {
            Contract::load_from("./out/release/market.bin", config)?
                .deploy(wallet, TxPolicies::default())
                .await?
        };

        let market = MarketContract::new(id.clone(), wallet.clone());

        Ok(Self { instance: market })
    }

    pub async fn new(contract_id: ContractId, wallet: WalletUnlocked) -> Self {
        Self {
            instance: MarketContract::new(contract_id, wallet),
        }
    }

    pub async fn with_account(&self, account: &WalletUnlocked) -> anyhow::Result<Self> {
        Ok(Self {
            instance: MarketContract::new(self.instance.contract_id().clone(), account.clone()),
        })
    }

    pub fn id(&self) -> Bytes32 {
        self.instance.contract_id().hash
    }

    pub fn contract_id(&self) -> &Bech32ContractId {
        self.instance.contract_id()
    }

    // Contract methods
    // # 0. Activate contract
    pub async fn activate_contract(
        &self,
        market_configuration: MarketConfiguration,
        owner: Identity,
    ) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .activate_contract(market_configuration, owner)
            .call()
            .await?)
    }

    // # 1. Debug functionality (for testing purposes)
    pub async fn debug_increment_timestamp(&self) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .debug_increment_timestamp()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    // # 2. Collateral asset management
    pub async fn add_collateral_asset(
        &self,
        config: &CollateralConfiguration,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .add_collateral_asset(config.clone())
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn pause_collateral_asset(
        &self,
        asset_id: AssetId,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .pause_collateral_asset(asset_id.into())
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn resume_collateral_asset(
        &self,
        asset_id: AssetId,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .resume_collateral_asset(asset_id.into())
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn update_collateral_asset(
        &self,
        asset_id: AssetId,
        config: &CollateralConfiguration,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .update_collateral_asset(asset_id.into(), config.clone())
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_collateral_configurations(
        &self,
    ) -> anyhow::Result<CallResponse<Vec<CollateralConfiguration>>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_collateral_configurations()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    // # 3. Collateral asset management (Supply and Withdrawal)
    pub async fn supply_collateral(
        &self,
        asset_id: AssetId,
        amount: u64,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let call_params = CallParameters::default()
            .with_amount(amount)
            .with_asset_id(asset_id);
        Ok(self
            .instance
            .methods()
            .supply_collateral()
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .with_tx_policies(tx_policies)
            .call_params(call_params)?
            .call()
            .await?)
    }

    pub async fn withdraw_collateral(
        &self,
        contract_ids: &[&dyn ContractDependency],
        asset_id: AssetId,
        amount: u64,
        price_data_update: &PriceDataUpdate,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);
        let call_params = CallParameters::default().with_amount(price_data_update.update_fee);

        Ok(self
            .instance
            .methods()
            .withdraw_collateral(asset_id, amount, price_data_update.clone())
            .with_tx_policies(tx_policies)
            .call_params(call_params)?
            .with_contracts(contract_ids)
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .call()
            .await?)
    }

    pub async fn get_user_collateral(
        &self,
        account: Identity,
        asset_id: AssetId,
    ) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_user_collateral(account, asset_id)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_all_user_collateral(
        &self,
        account: Identity,
    ) -> anyhow::Result<CallResponse<Vec<(AssetId, u64)>>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_all_user_collateral(account)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn totals_collateral(&self, asset_id: AssetId) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .totals_collateral(asset_id)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_all_totals_collateral(
        &self,
    ) -> anyhow::Result<CallResponse<Vec<(AssetId, u64)>>> {
        Ok(self
            .instance
            .methods()
            .get_all_totals_collateral()
            .call()
            .await?)
    }

    // # 4. Base asset management (Supply and Withdrawal)
    pub async fn supply_base(
        &self,
        base_asset_id: AssetId,
        amount: u64,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);
        let call_params = CallParameters::default()
            .with_amount(amount)
            .with_asset_id(base_asset_id);

        Ok(self
            .instance
            .methods()
            .supply_base()
            .with_tx_policies(tx_policies)
            .call_params(call_params)?
            .call()
            .await?)
    }

    pub async fn withdraw_base(
        &self,
        contract_ids: &[&dyn ContractDependency],
        amount: u64,
        price_data_update: &PriceDataUpdate,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);
        let call_params = CallParameters::default().with_amount(price_data_update.update_fee);

        Ok(self
            .instance
            .methods()
            .withdraw_base(amount.into(), price_data_update.clone())
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .with_contracts(contract_ids)
            .with_tx_policies(tx_policies)
            .call_params(call_params)?
            .call()
            .await?)
    }

    pub async fn get_user_supply_borrow(&self, account: Identity) -> anyhow::Result<(u128, u128)> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let (supply, borrow) = self
            .instance
            .methods()
            .get_user_supply_borrow(account)
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;

        Ok((convert_u256_to_u128(supply), convert_u256_to_u128(borrow)))
    }

    pub async fn available_to_borrow(
        &self,
        contract_ids: &[&dyn ContractDependency],
        account: Identity,
    ) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let res = self
            .instance
            .methods()
            .available_to_borrow(account)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(res))
    }

    // # 5. Liquidation management
    pub async fn absorb(
        &self,
        contract_ids: &[&dyn ContractDependency],
        accounts: Vec<Identity>,
        price_data_update: &PriceDataUpdate,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);
        let call_params = CallParameters::default().with_amount(price_data_update.update_fee);

        Ok(self
            .instance
            .methods()
            .absorb(accounts, price_data_update.clone())
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call_params(call_params)?
            .call()
            .await?)
    }

    pub async fn is_liquidatable(
        &self,
        contract_ids: &[&dyn ContractDependency],
        account: Identity,
    ) -> anyhow::Result<CallResponse<bool>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .is_liquidatable(account)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?)
    }

    // # 6. Protocol collateral management
    pub async fn buy_collateral(
        &self,
        contract_ids: &[&dyn ContractDependency],
        base_asset_id: AssetId,
        amount: u64,
        asset_id: AssetId,
        min_amount: u64,
        recipient: Identity,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let call_params_base_asset = CallParameters::default()
            .with_amount(amount)
            .with_asset_id(base_asset_id); // Buy collateral with base asset

        Ok(self
            .instance
            .methods()
            .buy_collateral(asset_id, min_amount.into(), recipient)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call_params(call_params_base_asset)?
            .with_variable_output_policy(VariableOutputPolicy::Exactly(2))
            .call()
            .await?)
    }

    pub async fn collateral_value_to_sell(
        &self,
        contract_ids: &[&dyn ContractDependency],
        asset_id: AssetId,
        collateral_amount: u64,
    ) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .collateral_value_to_sell(asset_id, collateral_amount)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?)
    }

    pub async fn quote_collateral(
        &self,
        contract_ids: &[&dyn ContractDependency],
        asset_id: AssetId,
        base_amount: u64,
    ) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .quote_collateral(asset_id.into(), base_amount)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?)
    }

    // # 7. Reserves management
    pub async fn get_reserves(&self) -> anyhow::Result<CallResponse<I256>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_reserves()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn withdraw_reserves(
        &self,
        to: Identity,
        amount: u64,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .withdraw_reserves(to, amount.into())
            .with_tx_policies(tx_policies)
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .call()
            .await?)
    }

    pub async fn get_collateral_reserves(
        &self,
        asset_id: AssetId,
    ) -> anyhow::Result<CallResponse<I256>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_collateral_reserves(asset_id)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    // # 9. Pause management
    pub async fn pause(&self, config: &PauseConfiguration) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .pause(config.clone())
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    // # 10. Getters
    pub async fn get_market_configuration(
        &self,
    ) -> anyhow::Result<CallResponse<MarketConfiguration>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_market_configuration()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_market_basics(&self) -> anyhow::Result<CallResponse<MarketBasics>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_market_basics()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_market_basics_with_interest(
        &self,
    ) -> anyhow::Result<CallResponse<MarketBasics>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_market_basics_with_interest()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_user_basic(
        &self,
        account: Identity,
    ) -> anyhow::Result<CallResponse<UserBasic>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_user_basic(account)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_user_balance_with_interest(
        &self,
        account: Identity,
    ) -> anyhow::Result<CallResponse<I256>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_user_balance_with_interest(account)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_utilization(&self) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let res = self
            .instance
            .methods()
            .get_utilization()
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;
        Ok(convert_u256_to_u128(res))
    }

    pub async fn balance_of(&self, asset_id: AssetId) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .balance_of(asset_id)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_supply_rate(&self, utilization: u64) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let value = self
            .instance
            .methods()
            .get_supply_rate(utilization.into())
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(value))
    }

    pub async fn get_borrow_rate(&self, utilization: u64) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let value = self
            .instance
            .methods()
            .get_borrow_rate(utilization.into())
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(value))
    }

    // # 10. Pyth Oracle management
    pub async fn set_pyth_contract_id(
        &self,
        contract_id: ContractId,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .set_pyth_contract_id(contract_id)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get_price(
        &self,
        contract_ids: &[&dyn ContractDependency],
        price_feed_id: Bits256,
    ) -> anyhow::Result<CallResponse<Price>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_price(price_feed_id)
            .with_contracts(contract_ids)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn update_fee(
        &self,
        contract_ids: &[&dyn ContractDependency],
        update_data: Vec<Bytes>,
    ) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .update_fee(update_data)
            .with_contracts(contract_ids)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn update_price_feeds_if_necessary(
        &self,
        contract_ids: &[&dyn ContractDependency],
        price_data_update: &PriceDataUpdate,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let call_params = CallParameters::default().with_amount(price_data_update.update_fee);

        Ok(self
            .instance
            .methods()
            .update_price_feeds_if_necessary(price_data_update.clone())
            .with_contracts(contract_ids)
            .with_tx_policies(tx_policies)
            .call_params(call_params)?
            .call()
            .await?)
    }

    // # 11. Changing market configuration
    pub async fn update_market_configuration(
        &self,
        configuration: &MarketConfiguration,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .update_market_configuration(configuration.clone())
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    // # 12. Ownership management
    pub async fn transfer_ownership(
        &self,
        new_owner: Identity,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .transfer_ownership(new_owner)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn renounce_ownership(&self) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .renounce_ownership()
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn print_debug_state(
        &self,
        wallets: &Vec<WalletUnlocked>,
        base: &Asset,
        collateral: &Asset,
    ) -> anyhow::Result<()> {
        let base_asset_id = base.asset_id;
        let base_decimals = base.decimals;
        let base_symbol = base.symbol.clone();

        let collateral_asset_id = collateral.asset_id;
        let collateral_decimals = collateral.decimals;
        let collateral_symbol = collateral.symbol.clone();

        let alice = wallets[1].clone();
        let alice_account: Identity = alice.address().into();

        let bob = wallets[2].clone();
        let bob_account: Identity = bob.address().into();

        let chad = wallets[3].clone();
        let chad_account = chad.address().into();

        let scale15 = 10u64.pow(15) as f64;
        let scale18 = 10u64.pow(18) as f64;

        let market_basic = self.get_market_basics().await?.value;
        let base_balance = self.balance_of(base_asset_id).await?.value as f64
            / 10u64.pow(base_decimals.try_into().unwrap()) as f64;
        let collateral_balance = format_units(
            self.balance_of(collateral.asset_id).await?.value,
            collateral_decimals,
        );
        let utilization = self.get_utilization().await? as f64 / scale18;
        let s_rate = convert_u256_to_u128(market_basic.base_supply_index) as f64 / scale15;
        let b_rate = convert_u256_to_u128(market_basic.base_borrow_index) as f64 / scale15;
        let total_collateral = self.totals_collateral(collateral.asset_id).await?.value;
        let last_accrual_time = market_basic.last_accrual_time;
        let base_reserves = convert_i256_to_i128(&self.get_reserves().await?.value);

        let base_reserves = format!(
            "{} {base_symbol}",
            base_reserves as f64 / 10u64.pow(base_decimals.try_into().unwrap()) as f64
        );
        let collateral_reserves = convert_i256_to_i128(
            &self
                .get_collateral_reserves(collateral.asset_id)
                .await?
                .value,
        );
        let collateral_reserves = format!(
            "{} {collateral_symbol}",
            collateral_reserves as f64 / 10u64.pow(collateral_decimals as u32) as f64
        );
        let supply_base = convert_u256_to_u128(market_basic.total_supply_base) as f64 * s_rate
            / 10u64.pow(base_decimals.try_into().unwrap()) as f64;
        let borrow_base = convert_u256_to_u128(market_basic.total_borrow_base) as f64 * b_rate
            / 10u64.pow(base_decimals.try_into().unwrap()) as f64;

        println!("🏦 Market\n  Total supply {supply_base} {base_symbol} | Total borrow {borrow_base} {base_symbol}");
        println!(
        "  Total {base_symbol} balance = {base_balance} {base_symbol} | Total {collateral_symbol} balance = {collateral_balance} {collateral_symbol}");
        println!("  reserves: {base_reserves} | {collateral_reserves}");
        println!("  sRate {s_rate} | bRate {b_rate}");
        println!(
            "  Total collateral {} {collateral_symbol}",
            format_units(total_collateral, collateral_decimals)
        );
        println!("  Utilization {utilization} | Last accrual time {last_accrual_time}",);

        let basic = self.get_user_basic(alice_account).await?.value;
        let (supply, borrow) = self.get_user_supply_borrow(alice_account).await?;
        let supply = format_units_u128(supply, base_decimals);
        let borrow = format_units_u128(borrow, base_decimals);
        let usdc_balance = alice.get_asset_balance(&base_asset_id).await? as f64
            / 10u64.pow(base_decimals.try_into().unwrap()) as f64;
        let collateral_balance = alice.get_asset_balance(&collateral_asset_id).await? as f64
            / 10u64.pow(collateral_decimals as u32) as f64;
        let collateral_amount = self
            .get_user_collateral(alice_account, collateral.asset_id)
            .await?
            .value;
        println!("\nAlice 🦹");
        println!("  Principal = {}", convert_i256_to_i128(&basic.principal));
        println!("  Present supply = {supply} {base_symbol} | borrow = {borrow} {base_symbol}");
        println!(
            "  Supplied collateral {} {collateral_symbol}",
            format_units(collateral_amount, collateral_decimals)
        );
        println!(
            "  Balance {usdc_balance} {base_symbol} | {collateral_balance} {collateral_symbol}"
        );

        let basic = self.get_user_basic(bob_account).await?.value;
        let (supply, borrow) = self.get_user_supply_borrow(bob_account).await?;
        let supply = format_units_u128(supply, base_decimals);
        let borrow = format_units_u128(borrow, base_decimals);
        let usdc_balance = bob.get_asset_balance(&base_asset_id).await? as f64
            / 10u64.pow(base_decimals.try_into().unwrap()) as f64;
        let collateral_balance = bob.get_asset_balance(&collateral_asset_id).await? as f64
            / 10u64.pow(collateral_decimals as u32) as f64;
        let collateral_amount = self
            .get_user_collateral(bob_account, collateral.asset_id)
            .await?
            .value;
        println!("\nBob 🧛");

        println!("  Principal = {}", convert_i256_to_i128(&basic.principal));
        println!("  Present supply = {supply} {base_symbol} | borrow = {borrow} {base_symbol}");
        println!(
            "  Supplied collateral {} {collateral_symbol}",
            format_units(collateral_amount, collateral_decimals)
        );
        println!(
            "  Balance {usdc_balance} {base_symbol} | {collateral_balance} {collateral_symbol}"
        );

        let basic = self.get_user_basic(chad_account).await?.value;
        let (supply, borrow) = self.get_user_supply_borrow(chad_account).await?;
        let supply = format_units_u128(supply, base_decimals);
        let borrow = format_units_u128(borrow, base_decimals);
        let usdc_balance = chad.get_asset_balance(&base_asset_id).await? as f64
            / 10u64.pow(base_decimals.try_into().unwrap()) as f64;
        let collateral_balance = chad.get_asset_balance(&collateral_asset_id).await? as f64
            / 10u64.pow(collateral_decimals as u32) as f64;
        let collateral_amount = self
            .get_user_collateral(chad_account, collateral.asset_id)
            .await?
            .value;
        println!("\nChad 🤵");
        println!("  Principal = {}", convert_i256_to_i128(&basic.principal));
        println!("  Present supply = {supply} {base_symbol} | borrow = {borrow} {base_symbol}");
        println!(
            "  Supplied collateral {} {collateral_symbol}",
            format_units(collateral_amount, collateral_decimals)
        );
        println!(
            "  Balance {usdc_balance} {base_symbol} | {collateral_balance} {collateral_symbol}"
        );

        Ok(())
    }
}
