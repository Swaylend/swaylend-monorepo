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

pub struct FlashLoan {
    pub instance: FlashLoanContract<WalletUnlocked>,
}

impl FlashLoan {
    pub async fn deploy(
        wallet: &WalletUnlocked,
        random_address: bool,
    ) -> anyhow::Result<Self> {
        let configurables = FlashLoanContractConfigurables::default();

        let root = PathBuf::from(env!("CARGO_WORKSPACE_DIR"));

        let storage_configuration = StorageConfiguration::default().add_slot_overrides_from_file(
            root.join("contracts/flash_loan/out/release/flash-loan-storage_slots.json"),
        )?;

        let config = LoadConfiguration::default()
            .with_storage_configuration(storage_configuration)
            .with_configurables(configurables);

        let id = if random_address {
            let mut rng = rand::thread_rng();
            let salt = rng.gen::<[u8; 32]>();

            Contract::load_from("./out/release/flash-loan.bin", config)?
                .with_salt(salt)
                .deploy(wallet, TxPolicies::default())
                .await?
        } else {
            Contract::load_from("./out/release/flash-loan.bin", config)?
                .deploy(wallet, TxPolicies::default())
                .await?
        };

        let flash_loan = FlashLoanContract::new(id.clone(), wallet.clone());

        Ok(Self { instance: flash_loan })
    }

    pub async fn new(contract_id: ContractId, wallet: WalletUnlocked) -> Self {
        Self {
            instance: FlashLoanContract::new(contract_id, wallet),
        }
    }

    pub async fn with_account(&self, account: &WalletUnlocked) -> anyhow::Result<Self> {
        Ok(Self {
            instance: FlashLoanContract::new(self.instance.contract_id().clone(), account.clone()),
        })
    }

    pub fn id(&self) -> Bytes32 {
        self.instance.contract_id().hash
    }

    pub fn contract_id(&self) -> &Bech32ContractId {
        self.instance.contract_id()
    }

    // Contract methods
    // # 0. Execute operation
    pub async fn execute_operation(
        &self,
        amount: u64,
        initiator: Identity,
        data: Vec<u8>,
    ) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .execute_operation(amount, initiator, data)
            .call()
            .await?)
    }
}
