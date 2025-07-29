library;

use ::errors::*;

use redstone_prices_abi::{RedstonePrices};
use std::bytes::Bytes;
use std::block::timestamp;
use pyth_interface::{PythCore, data_structures::price::PriceFeedId};
use std::context::msg_amount;
use std::call_frames::msg_asset_id;
use std::revert::require;
use std::convert::TryFrom;
use stork_sway_sdk::interface::*;
use signed_int::i128::I128;
use std::u128::*;

const TAI64_UNIX_ADJUSTMENT = 10 + (1 << 62);

pub struct Price {
    pub price: u256,
    pub exponent: u32,
    pub confidence: u256,
    pub publish_time: u64,
}

pub enum OraclePriceFeedId {
    Redstone: u256,
    Pyth: b256,
    Stork: b256,
    Twrap: (),
}

pub enum OracleType {
    Pyth: (),
    Redstone: (),
    Stork: (),
    Twrap: (),
}

pub enum OracleInput {
    Pyth: PythOracleInput,
    Redstone: RedstoneOracleInput,
    Stork: StorkOracleInput,
    Twrap: TwrapOracleInput,
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
    pub price_feed_id: OraclePriceFeedId,
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
    
    pub price_feed_ids: Vec<u256>,
    pub payload: Bytes,
}

pub struct StorkOracleInput {
    /// Contract ID of the Stork contract.
    pub contract_id: ContractId,

    /// This field incldues the update data for updating the price feeds.
    pub update_data: Vec<TemporalNumericValueInput>,
}

pub struct TwrapOracleInput {
    /// Contract ID of the Twrap contract.
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
// pub const ORACLE_MAX_CONF_WIDTH: u256 = 300; // 300 / 10000 = 3.0 % 
pub const ORACLE_CONF_BASIS_POINTS: u256 = 10_000; // 1e4

impl Oracle {
    pub fn get_price(self, price_feed_id: OraclePriceFeedId, oracle_max_confidence_width: u256) -> (bool, Price) {
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
                
                if let OraclePriceFeedId::Pyth(id) = price_feed_id {
                    let price = oracle.price_unsafe(id);

                    // validate values
                    if price.publish_time < timestamp() {
                        let staleness = timestamp() - price.publish_time;
                        if staleness > ORACLE_MAX_STALENESS {
                            is_price_valid = false;
                        }
                    } else {
                        let aheadness = price.publish_time - timestamp();
                        if aheadness > ORACLE_MAX_AHEADNESS {
                            is_price_valid = false;
                        }
                    }

                    if price.price == 0 {
                        is_price_valid = false;
                    }

                    if u256::from(price.confidence) > (u256::from(price.price) * oracle_max_confidence_width / ORACLE_CONF_BASIS_POINTS) {
                        is_price_valid = false;
                    }

                    if is_price_valid {
                        final_price = Price {
                            price: price.price.into(),
                            exponent: price.exponent,
                            confidence: price.confidence.into(),
                            publish_time: price.publish_time,
                        };
                    }
                } else {
                    require(false, Error::InvalidPriceFeedId);
                }
            },
            OracleType::Redstone => {
                let oracle = abi(RedstonePrices, contract_id.bits());

                if let OraclePriceFeedId::Redstone(id) = price_feed_id {
                    let price = oracle.get_price(id);

                    if price.price == 0 {
                        is_price_valid = false;
                    }

                    // validate values
                    if price.publish_time < timestamp() {
                        let staleness = timestamp() - price.publish_time;
                        if staleness > ORACLE_MAX_STALENESS {
                            is_price_valid = false;
                        }
                    } else {
                        let aheadness = price.publish_time - timestamp();
                        if aheadness > ORACLE_MAX_AHEADNESS {
                            is_price_valid = false;
                        }
                    }

                    if is_price_valid {
                        final_price = Price {
                            price: price.price,
                            exponent: price.exponent,
                            confidence: price.confidence.into(),
                            publish_time: price.publish_time,
                        };
                    }
                } else {
                    require(false, Error::InvalidPriceFeedId);
                }
            },
            OracleType::Stork => {
                let oracle = abi(Stork, contract_id.bits());
                if let OraclePriceFeedId::Stork(id) = price_feed_id {
                    let price = oracle.get_temporal_numeric_value_unchecked_v1(id);


                    // Check if the price is negative or zero
                    if price.quantized_value.underlying() <= I128::indent(){
                        is_price_valid = false;
                    }

                    let price_u256 = u256::from(price.quantized_value.underlying() - I128::indent());

                    let timestamp_tai64 = price.timestamp_ns / 1_000_000_000 + TAI64_UNIX_ADJUSTMENT;

                    // validate values
                    if timestamp_tai64 < timestamp() {
                        let staleness = timestamp() - timestamp_tai64;
                        if staleness > ORACLE_MAX_STALENESS {
                            is_price_valid = false;
                        }
                    } else {
                        let aheadness = timestamp_tai64 - timestamp();
                        if aheadness > ORACLE_MAX_AHEADNESS {
                            is_price_valid = false;
                        }
                    }

                    if is_price_valid {
                        final_price = Price {
                            price: price_u256,
                            exponent: 18,
                            confidence: 0,
                            publish_time: timestamp_tai64,
                        };
                    }
                } else {
                    require(false, Error::InvalidPriceFeedId);
                }
            }
            OracleType::Twrap => {
                require(false, "Not implemented yet");
            },
        };

        return (is_price_valid, final_price);
    }

    pub fn update_price_feeds(oracle_input: OracleInput) {
         match oracle_input {
            OracleInput::Pyth(input) => {
                let contract_id = input.contract_id;
                let oracle = abi(PythCore, contract_id.bits());

                let update_fee = oracle.update_fee(input.update_data);

                // Check if the payment is sufficient
                require(
                    msg_amount() >= update_fee && msg_asset_id() == AssetId::base(),
                    Error::InvalidPayment,
                );

                oracle.update_price_feeds_if_necessary {
                    asset_id: AssetId::base().bits(),
                    coins: update_fee,
                }(
                    input.price_feed_ids,
                    input.publish_times,
                    input
                        .update_data,
                );
            },
            OracleInput::Redstone(input) => {
                let contract_id = input.contract_id;
                let oracle = abi(RedstonePrices, contract_id.bits());

                oracle.update_prices(input.price_feed_ids, input.payload);
            },
            OracleInput::Stork(input) => {
                let contract_id = input.contract_id;
                let oracle = abi(Stork, contract_id.bits());

                let update_fee = oracle.get_update_fee_v1(input.update_data);

                // Check if the payment is sufficient
                require(
                    msg_amount() >= update_fee && msg_asset_id() == AssetId::base(),
                    Error::InvalidPayment,
                );

                oracle.update_temporal_numeric_values_v1 {
                    asset_id: AssetId::base().bits(),
                    coins: update_fee,
                }(input.update_data);
            },
            OracleInput::Twrap(input) => {
                let contract_id = input.contract_id;
                // TODO: Implement
                require(false, "Not implemented yet");
            },
        }
    }
}