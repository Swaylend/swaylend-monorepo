contract;

use redstone_prices_abi::*;

use std::{block::timestamp, bytes::Bytes, vec::Vec};
use std::storage::storage_vec::*;
use std::storage::storage_map::*;
use std::hash::Hash;
use redstone::{core::{config::Config, processor::process_input}, utils::vec::*};
use sway_libs::ownership::*;

const VERSION = 1u8;
const REDSTONE_PRICES_EXPONENT = 8u32;

storage {
    prices: StorageMap<u256, Price> = StorageMap {},
    signer_count_threshold: u64 = 3,
    allowed_signers: StorageVec<b256> = StorageVec {},
}

impl RedstonePrices for Contract {
    fn get_version() -> u8 {
        VERSION
    }

    #[storage(write)]
    fn activate(signer_count_threshold: u64, allowed_signers: Vec<b256>, owner: Identity) {
        initialize_ownership(owner);

        storage.signer_count_threshold.write(signer_count_threshold);
        storage.allowed_signers.store_vec(allowed_signers);
    }

    #[storage(read)]
    fn get_signer_count_threshold() -> u64 {
        storage.signer_count_threshold.read()
    }

    #[storage(write)]
    fn set_signer_count_threshold(count: u64) {
        only_owner();
        storage.signer_count_threshold.write(count);
    }

    #[storage(read)]
    fn get_allowed_signers() -> Vec<b256> {
       storage.allowed_signers.load_vec()
    }

    #[storage(write)]
    fn set_allowed_signers(signers: Vec<b256>) {
        only_owner();

        storage.allowed_signers.store_vec(signers);
    }

    #[storage(write)]
    fn add_allowed_signer(signer: b256) {
        only_owner();

        let signers = storage.allowed_signers.load_vec();

        // Check if the signer is already in the list
        require(signers.index_of(signer).is_none(), Error::SignerAlreadyInList);

        storage.allowed_signers.push(signer);
    }

    #[storage(write)]
    fn remove_allowed_signer(signer: b256) {
        only_owner();
    
        let signers = storage.allowed_signers.load_vec();
        let index = signers.index_of(signer);

        require(index.is_some(), Error::SignerNotInList);

        storage.allowed_signers.remove(index.unwrap());
    }

    #[storage(read)]
    fn get_price(price_feed_id: u256) -> Price {
        let price = storage.prices.get(price_feed_id).try_read();

        require(price.is_some(), Error::PriceNotFound);

        price.unwrap()
    }

    #[storage(write)]
    fn update_prices(feed_ids: Vec<u256>, payload: Bytes) {
        let timestamp = timestamp();

        let config = Config {
            feed_ids: feed_ids,
            signers: storage.allowed_signers.load_vec(),
            signer_count_threshold: storage.signer_count_threshold.read(),
            block_timestamp: timestamp - (10 + (1 << 62)),
        };

        let (aggregated_values, timestamp) = process_input(payload, config);

        let mut i = 0;
        while i < aggregated_values.len() {
            let price_feed_id = feed_ids.get(i).unwrap();

            let mut current_price = storage.prices.get(price_feed_id).try_read();
            
            if current_price.is_some() && current_price.unwrap().publish_time > timestamp {
                continue;
            }

            let price = aggregated_values.get(i).unwrap();
            let exponent = REDSTONE_PRICES_EXPONENT;
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
