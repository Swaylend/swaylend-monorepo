use pyth_mock::*;

use std::path::PathBuf;

use fuels::{
    accounts::wallet::WalletUnlocked,
    programs::{
        contract::{Contract, LoadConfiguration, StorageConfiguration},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, Bits256, Bytes},
};
use rand::Rng;

pub struct PythMockContract {
    pub instance: PythMock<WalletUnlocked>,
}

impl PythMockContract {
    pub async fn deploy(wallet: &WalletUnlocked) -> anyhow::Result<Self> {
        let mut rng = rand::thread_rng();
        let salt = rng.gen::<[u8; 32]>();

        let storage_configuration = StorageConfiguration::default();

        let contract_configuration =
            LoadConfiguration::default().with_storage_configuration(storage_configuration);

        let pyth_mock_binary_path = PathBuf::from(env!("CARGO_WORKSPACE_DIR"))
            .join("contracts/pyth-mock/out/release/pyth_mock.bin");

        let contract_id = Contract::load_from(pyth_mock_binary_path, contract_configuration)?
            .with_salt(salt)
            .deploy(wallet, TxPolicies::default())
            .await?;

        let pyth_mock = PythMock::new(contract_id.clone(), wallet.clone());

        Ok(Self {
            instance: pyth_mock,
        })
    }

    pub async fn price(&self, price_feed_id: Bits256) -> anyhow::Result<CallResponse<Price>> {
        Ok(self
            .instance
            .methods()
            .price(price_feed_id)
            .simulate()
            .await?)
    }

    pub async fn update_price_feeds(
        &self,
        update_data: Vec<Bytes>,
    ) -> anyhow::Result<CallResponse<()>> {
        Ok(self
            .instance
            .methods()
            .update_price_feeds(update_data)
            .call()
            .await?)
    }

    pub async fn create_update_data(
        &self,
        prices: &Vec<(Bits256, (u64, u32, u64, u64))>,
    ) -> anyhow::Result<Vec<Bytes>> {
        let mut update_data: Vec<Bytes> = Vec::new();

        for (price_feed_id, (price, exponent, publish_time, confidence)) in prices {
            let mut current_update_data: Vec<u8> = Vec::new();
            let price_feed_id_bytes = price_feed_id
                .0
                .iter()
                .map(|byte| *byte)
                .collect::<Vec<u8>>();

            current_update_data.extend(price_feed_id_bytes);
            current_update_data.extend(price.to_be_bytes());
            current_update_data.extend(exponent.to_be_bytes());
            current_update_data.extend(publish_time.to_be_bytes());
            current_update_data.extend(confidence.to_be_bytes());

            update_data.push(Bytes {
                0: current_update_data,
            });
        }

        Ok(update_data)
    }

    // Vec<(PriceFeedId, Price)>
    pub async fn update_prices(
        &self,
        prices: &Vec<(Bits256, (u64, u32, u64, u64))>,
    ) -> anyhow::Result<CallResponse<()>> {
        let update_data: Vec<Bytes> = self.create_update_data(prices).await?;

        Ok(self
            .instance
            .methods()
            .update_price_feeds(update_data)
            .call()
            .await?)
    }
}
