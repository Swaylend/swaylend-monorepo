library;

use std::bytes::Bytes;

pub struct Price {
    pub price: u256,
    pub exponent: u32,
    pub confidence: u64,
    pub publish_time: u64, // Timestamp of the last update in TAI64
}

pub enum Error {
    PriceNotFound: (),

    SignerAlreadyInList: (),
    SignerNotInList: (),
}

abi RedstonePrices {
    fn get_version() -> u8;

    #[storage(write)]
    fn activate(signer_count_threshold: u64, allowed_signers: Vec<b256>, owner: Identity);

    #[storage(read)]
    fn get_signer_count_threshold() -> u64;

    #[storage(read)]
    fn get_allowed_signers() -> Vec<b256>;

    #[storage(write)]
    fn update_configuration(signer_count_threshold: u64, allowed_signers: Vec<b256>);

    #[storage(read)]
    fn get_price(price_feed_id: u256) -> Price;

    #[storage(read)]
    fn get_prices(feed_ids: Vec<u256>, payload: Bytes) -> (Vec<u256>, u64);
    
    #[storage(write)]
    fn update_prices(feed_ids: Vec<u256>, payload: Bytes);
}
