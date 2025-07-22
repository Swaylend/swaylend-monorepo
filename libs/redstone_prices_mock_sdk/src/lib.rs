use redstone_prices_mock::*;

use std::path::PathBuf;

use fuels::{
    accounts::wallet::Wallet,
    programs::{
        contract::{Contract, LoadConfiguration, StorageConfiguration},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, Bits256, Bytes, ContractId, Identity, U256},
};
use rand::Rng;

pub struct RedstonePricesMockContract {
    pub instance: RedstonePricesMock<Wallet>,
}

impl RedstonePricesMockContract {
    pub async fn deploy(wallet: &Wallet) -> anyhow::Result<Self> {
        let mut rng = rand::thread_rng();
        let salt = rng.gen::<[u8; 32]>();

        let storage_configuration = StorageConfiguration::default();

        let contract_configuration =
            LoadConfiguration::default().with_storage_configuration(storage_configuration);

        let redstone_prices_binary_path = PathBuf::from(env!("CARGO_WORKSPACE_DIR"))
            .join("contracts/redstone-prices-mock/out/release/redstone_prices_mock.bin");

        let contract_id = Contract::load_from(redstone_prices_binary_path, contract_configuration)?
            .with_salt(salt)
            .deploy(wallet, TxPolicies::default())
            .await?
            .contract_id;

        let redstone_prices = RedstonePricesMock::new(contract_id.clone(), wallet.clone());

        Ok(Self {
            instance: redstone_prices,
        })
    }

    pub async fn activate(
        &self,
        signer_count_threshold: u64,
        allowed_signers: Vec<Bits256>,
        owner: Identity,
    ) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .activate(signer_count_threshold, allowed_signers, owner)
            .call()
            .await?)
    }

    pub async fn get_signer_count_threshold(&self) -> anyhow::Result<CallResponse<u64>> {
        Ok(self
            .instance
            .methods()
            .get_signer_count_threshold()
            .call()
            .await?)
    }

    pub async fn set_signer_count_threshold(&self, count: u64) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .set_signer_count_threshold(count)
            .call()
            .await?)
    }

    pub async fn set_allowed_signers(
        &self,
        signers: Vec<Bits256>,
    ) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .set_allowed_signers(signers)
            .call()
            .await?)
    }

    pub async fn get_allowed_signers(&self) -> anyhow::Result<CallResponse<Vec<Bits256>>> {
        Ok(self.instance.methods().get_allowed_signers().call().await?)
    }

    pub async fn add_allowed_signer(&self, signer: Bits256) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .add_allowed_signer(signer)
            .call()
            .await?)
    }

    pub async fn remove_allowed_signer(&self, signer: Bits256) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .remove_allowed_signer(signer)
            .call()
            .await?)
    }

    pub async fn get_price(&self, price_feed_id: U256) -> anyhow::Result<CallResponse<Price>> {
        Ok(self
            .instance
            .methods()
            .get_price(price_feed_id)
            .call()
            .await?)
    }

    pub async fn update_prices(
        &self,
        feed_ids: Vec<U256>,
        payload: Bytes,
    ) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .update_prices(feed_ids, payload)
            .call()
            .await?)
    }

    pub async fn create_update_data(
        &self,
        prices: &Vec<(U256, (u64, u32, u64, u64))>,
    ) -> anyhow::Result<(Vec<U256>, Bytes)> {
        let mut price_feed_ids: Vec<U256> = Vec::new();
        let mut update_data: Vec<u8> = Vec::new();

        for (price_feed_id, (price, _, publish_time, _)) in prices {
            update_data.extend(price.to_be_bytes());
            update_data.extend(publish_time.to_be_bytes());
            price_feed_ids.push(price_feed_id.clone());
        }

        Ok((price_feed_ids, Bytes { 0: update_data }))
    }

    pub fn contract_id(&self) -> ContractId {
        self.instance.contract_id()
    }
}
