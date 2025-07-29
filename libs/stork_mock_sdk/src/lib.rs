use stork_mock::{StorkMock, TemporalNumericValue, TemporalNumericValueInput, I128};

use std::path::PathBuf;

use fuels::{
    accounts::wallet::Wallet,
    programs::{
        calls::CallParameters,
        contract::{Contract, LoadConfiguration, StorageConfiguration},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, Bits256, ContractId},
};
use rand::Rng;

pub struct StorkMockContract {
    pub instance: StorkMock<Wallet>,
}

impl StorkMockContract {
    pub async fn deploy(wallet: &Wallet) -> anyhow::Result<Self> {
        let mut rng = rand::thread_rng();
        let salt = rng.gen::<[u8; 32]>();

        let storage_configuration = StorageConfiguration::default();

        let contract_configuration =
            LoadConfiguration::default().with_storage_configuration(storage_configuration);

        let stork_mock_binary_path = PathBuf::from(env!("CARGO_WORKSPACE_DIR"))
            .join("contracts/stork-mock/out/release/stork_mock.bin");

        let contract_id = Contract::load_from(stork_mock_binary_path, contract_configuration)?
            .with_salt(salt)
            .deploy(wallet, TxPolicies::default())
            .await?
            .contract_id;

        let stork_mock = StorkMock::new(contract_id.clone(), wallet.clone());

        Ok(Self {
            instance: stork_mock,
        })
    }

    pub async fn get_price(
        &self,
        price_feed_id: Bits256,
    ) -> anyhow::Result<CallResponse<TemporalNumericValue>> {
        Ok(self
            .instance
            .methods()
            .get_temporal_numeric_value_unchecked_v1(price_feed_id)
            .call()
            .await?)
    }

    pub async fn update_prices(
        &self,
        update_data: Vec<TemporalNumericValueInput>,
        fee: u64,
    ) -> anyhow::Result<CallResponse<()>> {
        if fee > 0 {
            let call_params = CallParameters::default().with_amount(fee);
            Ok(self
                .instance
                .methods()
                .update_temporal_numeric_values_v1(update_data)
                .call_params(call_params)?
                .call()
                .await?)
        } else {
            Ok(self
                .instance
                .methods()
                .update_temporal_numeric_values_v1(update_data)
                .call()
                .await?)
        }
    }

    pub fn contract_id(&self) -> ContractId {
        self.instance.contract_id()
    }

    pub async fn create_update_data(
        &self,
        prices: &Vec<(Bits256, (f64, u32, u64, u64))>,
    ) -> anyhow::Result<Vec<TemporalNumericValueInput>> {
        let mut update_data: Vec<TemporalNumericValueInput> = Vec::new();

        for (price_feed_id, (price, exponent, publish_time, _)) in prices {
            // NOTE: We don't want to overflow f64 so we are doing some weird hacks here
            // This differs from Redstone and Pyth mocks as we already provide
            // the scaled price. Here we need to scale it as it can overflow f64 (exponent is 18)
            let half = exponent / 2;
            let remainder = half + (exponent % 2);

            let indent = 2u128.pow(127);
            let price_u128 = (*price * 10u64.pow(half) as f64) as u128 * 10u128.pow(remainder);
            let price = I128::new(price_u128 + indent);

            let temporal_numeric_value = TemporalNumericValue {
                timestamp_ns: *publish_time,
                quantized_value: price,
            };

            update_data.push(TemporalNumericValueInput {
                id: price_feed_id.clone(),
                temporal_numeric_value: temporal_numeric_value,
                publisher_merkle_root: Bits256::zeroed(),
                value_compute_alg_hash: Bits256::zeroed(),
                r: Bits256::zeroed(),
                s: Bits256::zeroed(),
                v: 0, // TODO: Add signature
            });
        }

        Ok(update_data)
    }

    pub async fn create_update_data_market_types(
        &self,
        prices: &Vec<(Bits256, (f64, u32, u64, u64))>,
    ) -> anyhow::Result<Vec<market::TemporalNumericValueInput>> {
        let mut update_data: Vec<market::TemporalNumericValueInput> = Vec::new();

        for (price_feed_id, (price, exponent, publish_time, _)) in prices {
            // NOTE: We don't want to overflow f64 so we are doing some weird hacks here
            // This differs from Redstone and Pyth mocks as we already provide
            // the scaled price. Here we need to scale it as it can overflow f64 (exponent is 18)
            let half = exponent / 2;
            let remainder = half + (exponent % 2);

            let indent = 2u128.pow(127);
            let price_u128 = (*price * 10u64.pow(half) as f64) as u128 * 10u128.pow(remainder);
            let price = market::I128::new(price_u128 + indent);

            let temporal_numeric_value = market::TemporalNumericValue {
                timestamp_ns: *publish_time,
                quantized_value: price,
            };

            update_data.push(market::TemporalNumericValueInput {
                id: price_feed_id.clone(),
                temporal_numeric_value: temporal_numeric_value,
                publisher_merkle_root: Bits256::zeroed(),
                value_compute_alg_hash: Bits256::zeroed(),
                r: Bits256::zeroed(),
                s: Bits256::zeroed(),
                v: 0, // TODO: Add signature
            });
        }

        Ok(update_data)
    }
}
