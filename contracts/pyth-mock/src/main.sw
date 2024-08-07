contract;

use pyth_interface::{
    PythCore, 
    errors::PythError,
    data_structures::{
        price::*,
    },
};
use std::bytes::Bytes;
use std::hash::Hash;

storage {
    latest_price_feed: StorageMap<PriceFeedId, Price> = StorageMap {},
}

impl PythCore for Contract {
    #[storage(read)]
    fn ema_price(price_feed_id: PriceFeedId) -> Price {
        let price = storage.latest_price_feed.get(price_feed_id).try_read();
        require(price.is_some(), PythError::PriceFeedNotFound);
        price.unwrap()
    }

    #[storage(read)]
    fn ema_price_no_older_than(time_period: u64, price_feed_id: PriceFeedId) -> Price {
        let price = storage.latest_price_feed.get(price_feed_id).try_read();
        require(price.is_some(), PythError::PriceFeedNotFound);
        price.unwrap()
    }

    #[storage(read)]
    fn ema_price_unsafe(price_feed_id: PriceFeedId) -> Price {
        let price = storage.latest_price_feed.get(price_feed_id).try_read();
        require(price.is_some(), PythError::PriceFeedNotFound);
        price.unwrap()
    }

    #[storage(read), payable]
    fn parse_price_feed_updates(
        max_publish_time: u64,
        min_publish_time: u64,
        price_feed_ids: Vec<PriceFeedId>,
        update_data: Vec<Bytes>,
    ) -> Vec<PriceFeed> {
        let res: Vec<PriceFeed> = Vec::new();
        return res;
    }

    #[storage(read)]
    fn price(price_feed_id: PriceFeedId) -> Price {
        let price = storage.latest_price_feed.get(price_feed_id).try_read();
        require(price.is_some(), PythError::PriceFeedNotFound);
        price.unwrap()
    }

    #[storage(read)]
    fn price_no_older_than(time_period: u64, price_feed_id: PriceFeedId) -> Price {
        let price = storage.latest_price_feed.get(price_feed_id).try_read();
        require(price.is_some(), PythError::PriceFeedNotFound);
        price.unwrap()
    }

    #[storage(read)]
    fn price_unsafe(price_feed_id: PriceFeedId) -> Price {
        let price = storage.latest_price_feed.get(price_feed_id).try_read();
        require(price.is_some(), PythError::PriceFeedNotFound);
        price.unwrap() 
    }

    #[storage(read)]
    fn update_fee(update_data: Vec<Bytes>) -> u64 {
        let res: u64 = 1;
        res
    }

    #[storage(read, write), payable]
    fn update_price_feeds(update_data: Vec<Bytes>) {
        let mut index = 0;

        // Bytes structure
        // 0: price_feed_id -> b256
        // 1: price -> u64
        // 2: exponent -> u32
        // 3: publish_time -> u64
        // 4: confidence -> u64

        while index < update_data.len() {
            let payload = update_data.get(index).unwrap();
            let (price_feed_id, price) = decode_bytes(payload);
            storage.latest_price_feed.insert(price_feed_id, price);
            index += 1;
        }
    }

    #[storage(read, write), payable]
    fn update_price_feeds_if_necessary(
        price_feed_ids: Vec<PriceFeedId>,
        publish_times: Vec<u64>,
        update_data: Vec<Bytes>,
    ) {
        let mut index = 0;
    }

    #[storage(read)]
    fn valid_time_period() -> u64 {
        let res: u64 = 60;
        res
    }
}

fn decode_bytes(bytes: Bytes) -> (PriceFeedId, Price) {
    // First 32 bytes are price feed id
    let price_feed_id = b256::from_be_bytes(
       [
            bytes.get(0).unwrap(),
            bytes.get(1).unwrap(),
            bytes.get(2).unwrap(),
            bytes.get(3).unwrap(),
            bytes.get(4).unwrap(),
            bytes.get(5).unwrap(),
            bytes.get(6).unwrap(),
            bytes.get(7).unwrap(),
            bytes.get(8).unwrap(),
            bytes.get(9).unwrap(),
            bytes.get(10).unwrap(),
            bytes.get(11).unwrap(),
            bytes.get(12).unwrap(),
            bytes.get(13).unwrap(),
            bytes.get(14).unwrap(),
            bytes.get(15).unwrap(),
            bytes.get(16).unwrap(),
            bytes.get(17).unwrap(),
            bytes.get(18).unwrap(),
            bytes.get(19).unwrap(),
            bytes.get(20).unwrap(),
            bytes.get(21).unwrap(),
            bytes.get(22).unwrap(),
            bytes.get(23).unwrap(),
            bytes.get(24).unwrap(),
            bytes.get(25).unwrap(),
            bytes.get(26).unwrap(),
            bytes.get(27).unwrap(),
            bytes.get(28).unwrap(),
            bytes.get(29).unwrap(),
            bytes.get(30).unwrap(),
            bytes.get(31).unwrap(),
       ]
    );

    // Next 8 bytes are price
    let price = u64::from_be_bytes(
        [
            bytes.get(32).unwrap(),
            bytes.get(33).unwrap(),
            bytes.get(34).unwrap(),
            bytes.get(35).unwrap(),
            bytes.get(36).unwrap(),
            bytes.get(37).unwrap(),
            bytes.get(38).unwrap(),
            bytes.get(39).unwrap(),
        ]
    );

    // Next 4 bytes are exponent
    let exponent = u32::from_be_bytes(
        [
            bytes.get(40).unwrap(),
            bytes.get(41).unwrap(),
            bytes.get(42).unwrap(),
            bytes.get(43).unwrap(),
        ]
    );

    // Next 8 bytes are publish time
    let publish_time = u64::from_be_bytes(
        [
            bytes.get(44).unwrap(),
            bytes.get(45).unwrap(),
            bytes.get(46).unwrap(),
            bytes.get(47).unwrap(),
            bytes.get(48).unwrap(),
            bytes.get(49).unwrap(),
            bytes.get(50).unwrap(),
            bytes.get(51).unwrap(),
        ]
    );

    // Next 8 bytes are confidence
    let confidence = u64::from_be_bytes(
        [
            bytes.get(52).unwrap(),
            bytes.get(53).unwrap(),
            bytes.get(54).unwrap(),
            bytes.get(55).unwrap(),
            bytes.get(56).unwrap(),
            bytes.get(57).unwrap(),
            bytes.get(58).unwrap(),
            bytes.get(59).unwrap(),
        ]
    );


    return (
        PriceFeedId::from(price_feed_id),
        Price {
            price: price,
            exponent: exponent,
            publish_time: publish_time,
            confidence: confidence,
        },
    )
}
