contract;

use std::bytes::Bytes;
use std::string::String;
use std::hash::Hash;
use stork_sway_sdk::interface::*;
use stork_sway_sdk::temporal_numeric_value::TemporalNumericValue;
use std::vm::evm::evm_address::EvmAddress;
use signed_int::i128::I128;
use std::context::msg_amount;
use std::call_frames::msg_asset_id;
use stork_sway_sdk::errors::StorkError;

storage {
    single_update_fee_in_wei: u64 = 1,
    price_data: StorageMap<b256, TemporalNumericValue> = StorageMap {},
}

impl Stork for Contract {
   #[storage(read, write)]
    fn initialize(
        initial_owner: Identity,
        stork_public_key: EvmAddress,
        single_update_fee_in_wei: u64,
    ) {
       require(false, "Not implemented");
    }

    #[storage(read)]
    fn single_update_fee_in_wei() -> u64 {
        storage.single_update_fee_in_wei.read()
    }

    #[storage(read)]
    fn stork_public_key() -> EvmAddress {
        EvmAddress::zero()
    }

    fn verify_stork_signature_v1(
        stork_pubkey: EvmAddress,
        id: b256,
        recv_time: u64,
        quantized_value: I128,
        publisher_merkle_root: b256,
        value_compute_alg_hash: b256,
        r: b256,
        s: b256,
        v: u8,
    ) -> bool {
        false
    }

    #[storage(read, write), payable]
    fn update_temporal_numeric_values_v1(update_data: Vec<TemporalNumericValueInput>) {
        // Check if the paid fee is enough
        let total_fee = get_total_fee(update_data.len());
        require(msg_amount() >= total_fee && msg_asset_id() == AssetId::base(), StorkError::InsufficientFee);

        let mut i = 0;
        let len = update_data.len();
        while i < len {
            let update = update_data.get(i).unwrap();
            storage.price_data.insert(update.id, update.temporal_numeric_value);
            i += 1;
        }

    }

    #[storage(read)]
    fn get_temporal_numeric_value_unchecked_v1(id: b256) -> TemporalNumericValue {
       storage.price_data.get(id).try_read().unwrap()
    }

    #[storage(read)]
    fn get_update_fee_v1(update_data: Vec<TemporalNumericValueInput>) -> u64 {
        get_total_fee(update_data.len())
    }
  
    fn version() -> String {
        return String::from_ascii_str("1.0.0");
    }

    #[storage(read, write)]
    fn update_single_update_fee_in_wei(single_update_fee_in_wei: u64) {
        storage.single_update_fee_in_wei.write(single_update_fee_in_wei);
    }

    #[storage(read, write)]
    fn update_stork_public_key(stork_public_key: EvmAddress) {
        require(false, "Not implemented");
    }
}

#[storage(read)]
fn get_total_fee(totalNumUpdates: u64) -> u64 {
    totalNumUpdates * _single_update_fee_in_wei()
}

#[storage(read)]
fn _single_update_fee_in_wei() -> u64 {
    storage.single_update_fee_in_wei.read()
}