contract;

use redstone_prices_abi::*;

use std::bytes::Bytes;
use std::storage::storage_vec::*;
use std::storage::storage_map::*;
use std::hash::Hash;
use redstone::utils::vec::*;
use sway_libs::ownership::*;
use std::array_conversions::{u32::*, u64::*};

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
        // Bytes structure
        // 0: price -> u64
        // 1: publish_time -> u64

        let mut index = 0;

        while index < feed_ids.len() {
            let price_feed_id = feed_ids.get(index).unwrap();
            let price = decode_bytes(payload, index * 16);
            storage.prices.insert(price_feed_id, price);
            index += 1;
        }
    }
}


fn decode_bytes(bytes: Bytes, offset: u64) -> Price {
    // First 8 bytes are price
    let price = u64::from_be_bytes(
        [
            bytes.get(offset).unwrap(),
            bytes.get(offset + 1).unwrap(),
            bytes.get(offset + 2).unwrap(),
            bytes.get(offset + 3).unwrap(),
            bytes.get(offset + 4).unwrap(),
            bytes.get(offset + 5).unwrap(),
            bytes.get(offset + 6).unwrap(),
            bytes.get(offset + 7).unwrap(),
        ]
    );

    // Next 8 bytes are publish time
    let publish_time = u64::from_be_bytes(
        [
            bytes.get(offset + 8).unwrap(),
            bytes.get(offset + 9).unwrap(),
            bytes.get(offset + 10).unwrap(),
            bytes.get(offset + 11).unwrap(),
            bytes.get(offset + 12).unwrap(),
            bytes.get(offset + 13).unwrap(),
            bytes.get(offset + 14).unwrap(),
            bytes.get(offset + 15).unwrap(),
        ]
    );

    Price {
        price: price.into(),
        exponent: REDSTONE_PRICES_EXPONENT,
        publish_time: publish_time,
        confidence: 0,
    }
}
