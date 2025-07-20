contract;

use std::{block::timestamp, bytes::Bytes};
use std::hash::Hash;
use redstone::{core::{config::Config, processor::process_input}, utils::vec::*};

pub struct Price {
    pub price: u256,
    pub exponent: u32,
    pub confidence: u64,
    pub publish_time: u64,
}

abi RedstonePrices {
    fn get_version() -> u8;
    #[storage(read)]
    fn get_price(price_feed_id: u256) -> Price;
    #[storage(write)]
    fn update_prices(feed_ids: Vec<u256>, payloads: Bytes);
}

pub enum Error {
    PriceNotFound: (),
}

const VERSION = 1u8;

configurable {
    SIGNER_COUNT_THRESHOLD: u64 = 1,
    // TODO: Change to the actual allowed signers
    ALLOWED_SIGNERS: [b256; 1] = [0x0000000000000000000000000000000000000000000000000000000000000000],
}


storage {
    prices: StorageMap<u256, Price> = StorageMap {},
}

impl RedstonePrices for Contract {
    // Get version of the smart contract
    fn get_version() -> u8 {
        VERSION
    }

    #[storage(read)]
    fn get_price(price_feed_id: u256) -> Price {
        let price = storage.prices.get(price_feed_id).try_read();

        require(price.is_some(), Error::PriceNotFound);

        price.unwrap()
    }

    #[storage(write)]
    fn update_prices(feed_ids: Vec<u256>, payloads: Bytes) {
        let timestamp = timestamp();

        let config = Config {
            feed_ids: feed_ids,
            signers: Vec::new(), // TODO: Implement,
            signer_count_threshold: 1,
            block_timestamp: timestamp,
        };


        let (aggregated_values, timestamp) = process_input(payloads, config);

        let mut i = 0;
        while i < aggregated_values.len() {
            let price_feed_id = feed_ids.get(i).unwrap();

            let mut current_price = storage.prices.get(price_feed_id).try_read();
            
            if current_price.is_some() && current_price.unwrap().publish_time > timestamp {
                continue;
            }

            let price = aggregated_values.get(i).unwrap();
            let exponent = 6; // TODO: What exponent?
            let confidence = 0;
            let publish_time = timestamp;

            storage.prices.insert(price_feed_id, Price {
                price: price,
                exponent: exponent,
                confidence: confidence,
                publish_time: publish_time,
            });
        }
    }
}
