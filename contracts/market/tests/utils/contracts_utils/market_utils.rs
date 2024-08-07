use std::path::PathBuf;

use fuels::{
    accounts::{wallet::WalletUnlocked, ViewOnlyAccount},
    macros::abigen,
    programs::{
        calls::{CallParameters, ContractDependency},
        contract::{Contract, LoadConfiguration, StorageConfiguration},
        responses::CallResponse,
    },
    types::{
        bech32::Bech32ContractId, transaction::TxPolicies,
        transaction_builders::VariableOutputPolicy, Address, AssetId, Bits256, Bytes32, ContractId,
    },
};
use rand::Rng;
use serde::Deserialize;

use crate::utils::number_utils::{format_units, format_units_u128};

use super::token_utils::Asset;

abigen!(Contract(
    name = "Market",
    abi = "contracts/market/out/release/market-abi.json"
));

fn convert_i128(value: I256) -> i128 {
    let val: i128 = value.value.try_into().unwrap();
    val * if value.negative { -1 } else { 1 }
}

pub fn convert_u256_to_u128(value: fuels::types::U256) -> u128 {
    value.low_u128()
}

pub struct User {
    wallet: WalletUnlocked,
}

pub struct MarketContract {
    pub instance: Market<WalletUnlocked>,
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

pub struct ContractConfiguration {
    governor: Address,
    pause_guardian: Address,
    base_token: Bits256,
    base_token_decimals: u32,
    base_token_price_feed_id: Bits256,
    pyth_contract_id: ContractId,
    fuel_eth_base_asset_id: Bits256,
    market_config: MarketConfig,
}

pub fn get_market_config(
    governor: Address,
    pause_guardian: Address,
    base_token_bits256: Bits256,
    base_token_decimals: u32,
    base_token_price_feed_id: Bits256,
    pyth_contract_id: ContractId,
    fuel_eth_base_asset_id: Bits256,
) -> anyhow::Result<ContractConfiguration> {
    let config_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("contracts/market/tests/config.json");
    let config_json_str = std::fs::read_to_string(config_json_path)?;
    let config: MarketConfig = serde_json::from_str(&config_json_str)?;

    Ok(ContractConfiguration {
        governor,
        pause_guardian,
        base_token: base_token_bits256,
        base_token_decimals,
        base_token_price_feed_id,
        pyth_contract_id,
        fuel_eth_base_asset_id,
        market_config: config,
    })
}

const DEFAULT_GAS_LIMIT: u64 = 1_000_000;

impl MarketContract {
    pub async fn deploy(
        wallet: &WalletUnlocked,
        market_configuration: ContractConfiguration,
        debug_step: u64, // only for local test
        random_address: bool,
    ) -> anyhow::Result<Self> {
        let configurables = MarketConfigurables::default()
            .with_GOVERNOR(market_configuration.governor)?
            .with_PAUSE_GUARDIAN(market_configuration.pause_guardian)?
            .with_BASE_TOKEN(market_configuration.base_token)?
            .with_BASE_TOKEN_DECIMALS(market_configuration.base_token_decimals)?
            .with_BASE_TOKEN_PRICE_FEED_ID(market_configuration.base_token_price_feed_id)?
            .with_SUPPLY_KINK(market_configuration.market_config.supply_kink.into())?
            .with_BORROW_KINK(market_configuration.market_config.borrow_kink.into())?
            .with_SUPPLY_PER_SECOND_INTEREST_RATE_SLOPE_LOW(
                market_configuration
                    .market_config
                    .supply_per_second_interest_rate_slope_low
                    .into(),
            )?
            .with_SUPPLY_PER_SECOND_INTEREST_RATE_SLOPE_HIGH(
                market_configuration
                    .market_config
                    .supply_per_second_interest_rate_slope_high
                    .into(),
            )?
            .with_SUPPLY_PER_SECOND_INTEREST_RATE_BASE(
                market_configuration
                    .market_config
                    .supply_per_second_interest_rate_base
                    .into(),
            )?
            .with_BORROW_PER_SECOND_INTEREST_RATE_SLOPE_LOW(
                market_configuration
                    .market_config
                    .borrow_per_second_interest_rate_slope_low
                    .into(),
            )?
            .with_BORROW_PER_SECOND_INTEREST_RATE_SLOPE_HIGH(
                market_configuration
                    .market_config
                    .borrow_per_second_interest_rate_slope_high
                    .into(),
            )?
            .with_BORROW_PER_SECOND_INTEREST_RATE_BASE(
                market_configuration
                    .market_config
                    .borrow_per_second_interest_rate_base
                    .into(),
            )?
            .with_STORE_FRONT_PRICE_FACTOR(
                market_configuration
                    .market_config
                    .store_front_price_factor
                    .into(),
            )?
            .with_BASE_TRACKING_INDEX_SCALE(
                market_configuration
                    .market_config
                    .base_tracking_index_scale
                    .into(),
            )?
            .with_BASE_TRACKING_SUPPLY_SPEED(
                market_configuration
                    .market_config
                    .base_tracking_supply_speed
                    .into(),
            )?
            .with_BASE_TRACKING_BORROW_SPEED(
                market_configuration
                    .market_config
                    .base_tracking_borrow_speed
                    .into(),
            )?
            .with_BASE_MIN_FOR_REWARDS(
                market_configuration
                    .market_config
                    .base_min_for_rewards
                    .into(),
            )?
            .with_BASE_BORROW_MIN(market_configuration.market_config.base_borrow_min.into())?
            .with_TARGET_RESERVES(market_configuration.market_config.target_reserves.into())?
            .with_DEBUG_STEP(debug_step)?
            .with_FUEL_ETH_BASE_ASSET_ID(market_configuration.fuel_eth_base_asset_id)?;

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

        // TODO[Martin]: Revisting this clone
        let market = Market::new(id.clone(), wallet.clone());

        Ok(Self { instance: market })
    }

    pub async fn new(contract_id: ContractId, wallet: WalletUnlocked) -> Self {
        Self {
            instance: Market::new(contract_id, wallet),
        }
    }

    pub async fn with_account(&self, account: &WalletUnlocked) -> anyhow::Result<Self> {
        Ok(Self {
            instance: Market::new(self.instance.contract_id().clone(), account.clone()),
        })
    }

    pub fn id(&self) -> Bytes32 {
        self.instance.contract_id().hash
    }

    pub fn contract_id(&self) -> &Bech32ContractId {
        self.instance.contract_id()
    }

    // Contract methods
    pub async fn activate_contract(&self) -> anyhow::Result<CallResponse<()>> {
        Ok(self.instance.methods().activate_contract().call().await?)
    }

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

    pub async fn withdraw_base(
        &self,
        contract_ids: &[&dyn ContractDependency],
        amount: u64,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .withdraw_base(amount.into())
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .with_contracts(contract_ids)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn withdraw_collateral(
        &self,
        contract_ids: &[&dyn ContractDependency],
        asset_id: Bits256,
        amount: u64,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .withdraw_collateral(asset_id, amount.into())
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .call()
            .await?)
    }

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

    pub async fn get_user_collateral(
        &self,
        address: Address,
        asset_id: Bits256,
    ) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let res = self
            .instance
            .methods()
            .get_user_collateral(address, asset_id)
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(res))
    }

    pub async fn available_to_borrow(
        &self,
        contract_ids: &[&dyn ContractDependency],
        address: Address,
    ) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let res = self
            .instance
            .methods()
            .available_to_borrow(address)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(res))
    }

    pub async fn get_user_supply_borrow(&self, address: Address) -> anyhow::Result<(u128, u128)> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let (supply, borrow) = self
            .instance
            .methods()
            .get_user_supply_borrow(address)
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;

        Ok((convert_u256_to_u128(supply), convert_u256_to_u128(borrow)))
    }

    pub async fn get_user_basic(
        &self,
        address: Address,
    ) -> anyhow::Result<CallResponse<UserBasic>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .get_user_basic(address)
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

    pub async fn totals_collateral(&self, bits256: Bits256) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let res = self
            .instance
            .methods()
            .totals_collateral(bits256)
            .with_tx_policies(tx_policies)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(res))
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

    pub async fn balance_of(&self, bits256: Bits256) -> anyhow::Result<CallResponse<u64>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .balance_of(bits256)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

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

    pub async fn collateral_value_to_sell(
        &self,
        contract_ids: &[&dyn ContractDependency],
        asset_id: Bits256,
        collateral_amount: u64,
    ) -> anyhow::Result<u128> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let res = self
            .instance
            .methods()
            .collateral_value_to_sell(asset_id, collateral_amount.into())
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?
            .value;

        Ok(convert_u256_to_u128(res))
    }

    pub async fn buy_collateral(
        &self,
        contract_ids: &[&dyn ContractDependency],
        base_asset_id: AssetId,
        amount: u64,
        asset_id: Bits256,
        min_amount: u64,
        recipient: Address,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        let call_params = CallParameters::default()
            .with_amount(amount)
            .with_asset_id(base_asset_id);

        Ok(self
            .instance
            .methods()
            .buy_collateral(asset_id, min_amount.into(), recipient)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call_params(call_params)?
            .with_variable_output_policy(VariableOutputPolicy::Exactly(2))
            .call()
            .await?)
    }

    pub async fn absorb(
        &self,
        contract_ids: &[&dyn ContractDependency],
        addresses: Vec<Address>,
    ) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .absorb(addresses)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?)
    }

    pub async fn is_liquidatable(
        &self,
        contract_ids: &[&dyn ContractDependency],
        address: Address,
    ) -> anyhow::Result<CallResponse<bool>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(DEFAULT_GAS_LIMIT);

        Ok(self
            .instance
            .methods()
            .is_liquidatable(address)
            .with_tx_policies(tx_policies)
            .with_contracts(contract_ids)
            .call()
            .await?)
    }

    pub async fn get_collateral_reserves(
        &self,
        asset_id: Bits256,
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

    pub async fn print_debug_state(
        &self,
        wallets: &Vec<WalletUnlocked>,
        usdc: &Asset,
        collateral: &Asset,
    ) -> anyhow::Result<()> {
        let usdc_asset_id = usdc.asset_id;
        let collateral_asset_id = collateral.asset_id;
        let collateral_decimals = collateral.decimals;
        let collateral_symbol = collateral.symbol.clone();

        let alice = wallets[1].clone();
        let alice_address = Address::from(alice.address());

        let bob = wallets[2].clone();
        let bob_address = Address::from(bob.address());

        let chad = wallets[3].clone();
        let chad_address = Address::from(chad.address());

        let scale15 = 10u64.pow(15) as f64;
        let scale18 = 10u64.pow(18) as f64;

        let market_basic = self.get_market_basics().await?.value;
        let usdc_balance = self.balance_of(usdc.bits256).await?.value as f64 / 10u64.pow(6) as f64;
        let collateral_balance = format_units(
            self.balance_of(collateral.bits256).await?.value,
            collateral_decimals,
        );
        let utilization = self.get_utilization().await? as f64 / scale18;
        let s_rate = convert_u256_to_u128(market_basic.base_supply_index) as f64 / scale15;
        let b_rate = convert_u256_to_u128(market_basic.base_borrow_index) as f64 / scale15;
        let total_collateral = self.totals_collateral(collateral.bits256).await?;
        let last_accrual_time = market_basic.last_accrual_time;
        let usdc_reserves = convert_i128(self.get_reserves().await?.value);

        let usdc_reserves = format!("{} USDC", usdc_reserves as f64 / 10u64.pow(6) as f64);
        let collateral_reserves = convert_i128(
            self.get_collateral_reserves(collateral.bits256)
                .await?
                .value,
        );
        let collateral_reserves = format!(
            "{} {collateral_symbol}",
            collateral_reserves as f64 / 10u64.pow(collateral_decimals as u32) as f64
        );
        let supply_base = convert_u256_to_u128(market_basic.total_supply_base) as f64 * s_rate
            / 10u64.pow(6) as f64;
        let borrow_base = convert_u256_to_u128(market_basic.total_borrow_base) as f64 * b_rate
            / 10u64.pow(6) as f64;

        println!("🏦 Market\n  Total supply {supply_base} USDC | Total borrow {borrow_base} USDC",);
        println!(
        "  Total USDC balance = {usdc_balance} USDC | Total {collateral_symbol} balance = {collateral_balance} {collateral_symbol}");
        println!("  reserves: {usdc_reserves} | {collateral_reserves}");
        println!("  sRate {s_rate} | bRate {b_rate}");
        println!(
            "  Total collateral {} {collateral_symbol}",
            format_units_u128(total_collateral, collateral_decimals)
        );
        println!("  Utilization {utilization} | Last accrual time {last_accrual_time}",);

        let basic = self.get_user_basic(alice_address).await?.value;
        let (supply, borrow) = self.get_user_supply_borrow(alice_address).await?;
        let supply = format_units_u128(supply, 6);
        let borrow = format_units_u128(borrow, 6);
        let usdc_balance =
            alice.get_asset_balance(&usdc_asset_id).await? as f64 / 10u64.pow(6) as f64;
        let collateral_balance = alice.get_asset_balance(&collateral_asset_id).await? as f64
            / 10u64.pow(collateral_decimals as u32) as f64;
        let collateral_amount = self
            .get_user_collateral(alice_address, collateral.bits256)
            .await?;
        println!("\nAlice 🦹");
        println!("  Principal = {}", convert_i128(basic.principal));
        println!("  Present supply = {supply} USDC | borrow = {borrow} USDC");
        println!(
            "  Supplied collateral {} {collateral_symbol}",
            format_units_u128(collateral_amount, collateral_decimals)
        );
        println!("  Balance {usdc_balance} USDC | {collateral_balance} {collateral_symbol}");

        let basic = self.get_user_basic(bob_address).await?.value;
        let (supply, borrow) = self.get_user_supply_borrow(bob_address).await?;
        let supply = format_units_u128(supply, 6);
        let borrow = format_units_u128(borrow, 6);
        let usdc_balance =
            bob.get_asset_balance(&usdc_asset_id).await? as f64 / 10u64.pow(6) as f64;
        let collateral_balance = bob.get_asset_balance(&collateral_asset_id).await? as f64
            / 10u64.pow(collateral_decimals as u32) as f64;
        let collateral_amount = self
            .get_user_collateral(bob_address, collateral.bits256)
            .await?;
        println!("\nBob 🧛");

        println!("  Principal = {}", convert_i128(basic.principal));
        println!("  Present supply = {supply} USDC | borrow = {borrow} USDC");
        println!(
            "  Supplied collateral {} {collateral_symbol}",
            format_units_u128(collateral_amount, collateral_decimals)
        );
        println!("  Balance {usdc_balance} USDC | {collateral_balance} {collateral_symbol}");

        let basic = self.get_user_basic(chad_address).await?.value;
        let (supply, borrow) = self.get_user_supply_borrow(chad_address).await?;
        let supply = format_units_u128(supply, 6);
        let borrow = format_units_u128(borrow, 6);
        let usdc_balance =
            chad.get_asset_balance(&usdc_asset_id).await? as f64 / 10u64.pow(6) as f64;
        let collateral_balance = chad.get_asset_balance(&collateral_asset_id).await? as f64
            / 10u64.pow(collateral_decimals as u32) as f64;
        let collateral_amount = self
            .get_user_collateral(chad_address, collateral.bits256)
            .await?;
        println!("\nChad 🤵");
        println!("  Principal = {}", convert_i128(basic.principal));
        println!("  Present supply = {supply} USDC | borrow = {borrow} USDC");
        println!(
            "  Supplied collateral {} {collateral_symbol}",
            format_units_u128(collateral_amount, collateral_decimals)
        );
        println!("  Balance {usdc_balance} USDC | {collateral_balance} {collateral_symbol}");

        Ok(())
    }
}
