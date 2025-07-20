library;

use ::errors::*;

use std::bytes::Bytes;
use pyth_interface::{PythCore, data_structures::price::PriceFeedId};
use std::context::msg_amount;
use std::call_frames::msg_asset_id;
use std::revert::require;

pub struct Price {
    pub price: u64,
    pub exponent: u32,
    pub confidence: u64,
    pub publish_time: u64,
}

pub enum OracleType {
    Pyth: (),
    Redstone: (),
    Twrap: (),
    Stork: (),
}

pub enum OracleInput {
    Pyth: PythOracleInput,
    Redstone: RedstoneOracleInput,
    Twrap: TwrapOracleInput,
    Stork: StorkOracleInput,
}

/// This struct contains the configuration details for contract-wide oracle settings.
pub struct OracleGlobalConfiguration {
    pub contract_id: ContractId,
    pub is_disabled: bool,
    pub oracle_type: OracleType,
}

/// This struct contains the configuration details for an asset-specific oracle settings.
pub struct OracleAssetConfiguration {
    pub oracle_id: u64,
    pub price_feed_id: b256,
    pub is_disabled: bool,
}


pub struct PythOracleInput {
    /// Contract ID of the Pyth contract.
    pub contract_id: ContractId,

    /// This field represents the fee required to perform the update.
    pub update_fee: u64,
    /// This field contains a list of times when price feeds were published.
    pub publish_times: Vec<u64>,
    /// This field holds a collection of identifiers for the price feeds being updated.
    pub price_feed_ids: Vec<PriceFeedId>,
    /// This field includes the actual update data in bytes format.
    pub update_data: Vec<Bytes>,
}

pub struct RedstoneOracleInput {
    /// Contract ID of the Redstone contract.
    pub contract_id: ContractId,
    
    pub placeholder: (),
}

pub struct TwrapOracleInput {
    /// Contract ID of the Twrap contract.
    pub contract_id: ContractId,

    pub placeholder: (),    
}

pub struct StorkOracleInput {
    /// Contract ID of the Stork contract.
    pub contract_id: ContractId,

    pub placeholder: (),
}

pub struct Oracle {
    pub contract_id: ContractId,
    pub oracle_type: OracleType,
}

// Oracle configuration params
pub const ORACLE_MAX_STALENESS: u64 = 60; // 60 seconds
pub const ORACLE_MAX_AHEADNESS: u64 = 60; // 60 seconds
pub const ORACLE_MAX_CONF_WIDTH: u256 = 300; // 300 / 10000 = 3.0 % 
pub const ORACLE_CONF_BASIS_POINTS: u256 = 10_000; // 1e4

impl Oracle {
    pub fn get_price(self, price_feed_id: b256) -> (bool, Price) {
        let contract_id = self.contract_id;
        let oracle_type = self.oracle_type;

        let mut is_price_valid = true;
        let mut final_price = Price {
            price: 0,
            exponent: 0,
            confidence: 0,
            publish_time: 0,
        };

        match oracle_type {
            OracleType::Pyth => {
                let oracle = abi(PythCore, contract_id.bits());

                let price = oracle.price_unsafe(price_feed_id);

                // validate values
                if price.publish_time < std::block::timestamp() {
                    let staleness = std::block::timestamp() - price.publish_time;
                    if staleness > ORACLE_MAX_STALENESS {
                        is_price_valid = false;
                    }
                } else {
                    let aheadness = price.publish_time - std::block::timestamp();
                    if aheadness > ORACLE_MAX_AHEADNESS {
                        is_price_valid = false;
                    }
                }

                if price.price == 0 {
                    is_price_valid = false;
                }

                if u256::from(price.confidence) > (u256::from(price.price) * ORACLE_MAX_CONF_WIDTH / ORACLE_CONF_BASIS_POINTS) {
                    is_price_valid = false;
                }

                if is_price_valid {
                    final_price = Price {
                        price: price.price,
                        exponent: price.exponent,
                        confidence: price.confidence,
                        publish_time: price.publish_time,
                    };
                }
            },
            OracleType::Redstone => {
                require(false, "Not implemented yet");
            },
            OracleType::Twrap => {
                require(false, "Not implemented yet");
            },
            OracleType::Stork => {
                require(false, "Not implemented yet");
            },
            _ => {
                require(false, Error::InvalidOracleType);
            }
        };

        return (is_price_valid, final_price);
    }

    pub fn update_price_feeds(oracle_input: OracleInput) {
         match oracle_input {
            OracleInput::Pyth(input) => {
                let contract_id = input.contract_id;

                // Check if the payment is sufficient
                require(
                    msg_amount() >= input.update_fee && msg_asset_id() == AssetId::base(),
                    Error::InvalidPayment,
                );

                let oracle = abi(PythCore, contract_id.bits());

                oracle.update_price_feeds_if_necessary {
                    asset_id: AssetId::base().bits(),
                    coins: input.update_fee,
                }(
                    input.price_feed_ids,
                    input.publish_times,
                    input
                        .update_data,
                );
            },
            OracleInput::Redstone(input) => {
                let contract_id = input.contract_id;
                // TODO: Implement
                require(false, "Not implemented yet");
            },
            OracleInput::Twrap(input) => {
                let contract_id = input.contract_id;
                // TODO: Implement
                require(false, "Not implemented yet");
            },
            OracleInput::Stork(input) => {
                let contract_id = input.contract_id;
                // TODO: Implement
                require(false, "Not implemented yet");
            },
            _ => {
                require(false, Error::InvalidOracleInput);
            }
        }
    }
}