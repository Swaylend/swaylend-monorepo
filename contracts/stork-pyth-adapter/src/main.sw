contract;

// Stork -> Pyth adapter.
//
// The market contract talks to its oracle through the `PythCore` ABI and a
// single owner-settable `pyth_contract_id`. This contract implements that same
// ABI but sources its data from the Stork pull oracle, so the market can be
// moved onto Stork with one `set_pyth_contract_id` call and no redeploy of the
// audited market itself. Pointing `pyth_contract_id` back at Pyth reverts it.
//
// Two conversions matter:
//   * Stork quantises values to 18 decimals in an `I128`; Pyth exposes a `u64`
//     price plus a positive `exponent` meaning `10^-exponent`. An 18-decimal
//     ETH price overflows `u64`, so every feed is rescaled to its configured
//     exponent (what Pyth used to return for that feed).
//   * Stork timestamps are unix nanoseconds; Pyth publishes TAI64, which is
//     what the market compares against `std::block::timestamp()`.
//
// Stork has no confidence interval. The market derives collateral value from
// `price - confidence` and liquidation value from `price + confidence`, so
// reporting zero would silently drop a safety margin the protocol has today.
// Instead each feed carries a `conf_bps` and the adapter synthesises
// `confidence = price * conf_bps / 10_000`.

use std::{
    bytes::Bytes,
    call_frames::msg_asset_id,
    context::msg_amount,
    hash::Hash,
    u128::U128,
};
use signed_int::i128::I128;

// ---------------------------------------------------------------------------
// Stork interface
//
// Mirrors `stork_sway_sdk` field for field so the ABI encoding matches the
// deployed Stork contract. Declared locally rather than imported because the
// SDK pulls a std version that conflicts with the rest of this repo.
// ---------------------------------------------------------------------------

pub struct TemporalNumericValue {
    pub timestamp_ns: u64,
    pub quantized_value: I128,
}

pub struct TemporalNumericValueInput {
    pub temporal_numeric_value: TemporalNumericValue,
    pub id: b256,
    pub publisher_merkle_root: b256,
    pub value_compute_alg_hash: b256,
    pub r: b256,
    pub s: b256,
    pub v: u8,
}

abi Stork {
    #[payable, storage(read, write)]
    fn update_temporal_numeric_values_v1(update_data: Vec<TemporalNumericValueInput>);

    #[storage(read)]
    fn get_update_fee_v1(update_data: Vec<TemporalNumericValueInput>) -> u64;

    #[storage(read)]
    fn get_temporal_numeric_value_unchecked_v1(id: b256) -> TemporalNumericValue;
}

// ---------------------------------------------------------------------------
// Pyth-compatible surface
//
// Field order matches pyth-interface at the revision the market is built
// against; the market decodes by position, so this must not be reordered.
// ---------------------------------------------------------------------------

pub type PriceFeedId = b256;

pub struct Price {
    pub confidence: u64,
    pub exponent: u32,
    pub price: u64,
    pub publish_time: u64,
}

pub struct PriceFeed {
    pub ema_price: Price,
    pub id: PriceFeedId,
    pub price: Price,
}

abi PythCore {
    #[storage(read)]
    fn ema_price(price_feed_id: PriceFeedId) -> Price;
    #[storage(read)]
    fn ema_price_no_older_than(time_period: u64, price_feed_id: PriceFeedId) -> Price;
    #[storage(read)]
    fn ema_price_unsafe(price_feed_id: PriceFeedId) -> Price;
    #[payable, storage(read)]
    fn parse_price_feed_updates(
        max_publish_time: u64,
        min_publish_time: u64,
        price_feed_ids: Vec<PriceFeedId>,
        update_data: Vec<Bytes>,
    ) -> Vec<PriceFeed>;
    #[storage(read)]
    fn price(price_feed_id: PriceFeedId) -> Price;
    #[storage(read)]
    fn price_no_older_than(time_period: u64, price_feed_id: PriceFeedId) -> Price;
    #[storage(read)]
    fn price_unsafe(price_feed_id: PriceFeedId) -> Price;
    #[storage(read)]
    fn update_fee(update_data: Vec<Bytes>) -> u64;
    #[payable, storage(read, write)]
    fn update_price_feeds(update_data: Vec<Bytes>);
    #[payable, storage(read, write)]
    fn update_price_feeds_if_necessary(
        price_feed_ids: Vec<PriceFeedId>,
        publish_times: Vec<u64>,
        update_data: Vec<Bytes>,
    );
    #[storage(read)]
    fn valid_time_period() -> u64;
}

// ---------------------------------------------------------------------------
// Adapter administration
// ---------------------------------------------------------------------------

/// Per-feed wiring from a Pyth price feed id to a Stork asset id.
pub struct FeedConfig {
    /// Stork asset id, i.e. keccak256 of the encoded asset name ("ETHUSD").
    pub stork_id: b256,
    /// Absolute value of the Pyth exponent to report, e.g. 8 for 10^-8.
    pub exponent: u32,
    /// Synthetic confidence as basis points of price. Must stay under the
    /// market's 3% ceiling or `get_price_internal` rejects the price.
    pub conf_bps: u64,
}

abi StorkPythAdapter {
    #[storage(read, write)]
    fn initialize(owner: Identity, stork_contract_id: ContractId);
    #[storage(read, write)]
    fn set_feed(price_feed_id: PriceFeedId, config: FeedConfig);
    #[storage(read, write)]
    fn remove_feed(price_feed_id: PriceFeedId);
    #[storage(read, write)]
    fn set_stork_contract_id(stork_contract_id: ContractId);
    #[storage(read, write)]
    fn transfer_ownership(new_owner: Identity);
    #[storage(read)]
    fn get_feed(price_feed_id: PriceFeedId) -> Option<FeedConfig>;
    #[storage(read)]
    fn get_stork_contract_id() -> ContractId;
    #[storage(read)]
    fn owner() -> Identity;
}

pub enum AdapterError {
    AlreadyInitialized: (),
    NotInitialized: (),
    NotOwner: (),
    FeedNotConfigured: PriceFeedId,
    NegativePrice: PriceFeedId,
    PriceOverflow: PriceFeedId,
    InvalidExponent: (),
    ConfidenceTooWide: (),
    MalformedUpdateData: (),
    InvalidPayment: (),
}

/// Pyth's Fuel contract offsets unix seconds by 2^62 to produce TAI64; matched
/// here so staleness behaves exactly as it does against Pyth today.
const TAI64_DIFFERENCE: u64 = 4611686018427387904;
/// Stork quantises every value to 18 decimals.
const STORK_DECIMALS: u32 = 18;
/// Mirrors the market's own ORACLE_MAX_CONF_WIDTH (300 / 10_000 = 3%).
const MAX_CONF_BPS: u64 = 300;
/// 32 + 8 + 16 + 32 + 32 + 32 + 32 + 1
const ENCODED_UPDATE_LEN: u64 = 185;

storage {
    initialized: bool = false,
    owner: Identity = Identity::Address(Address::zero()),
    stork_contract_id: ContractId = ContractId::zero(),
    feeds: StorageMap<PriceFeedId, FeedConfig> = StorageMap {},
}

impl StorkPythAdapter for Contract {
    #[storage(read, write)]
    fn initialize(owner: Identity, stork_contract_id: ContractId) {
        require(!storage.initialized.read(), AdapterError::AlreadyInitialized);
        storage.initialized.write(true);
        storage.owner.write(owner);
        storage.stork_contract_id.write(stork_contract_id);
    }

    #[storage(read, write)]
    fn set_feed(price_feed_id: PriceFeedId, config: FeedConfig) {
        only_owner();
        require(config.exponent <= STORK_DECIMALS, AdapterError::InvalidExponent);
        require(config.conf_bps <= MAX_CONF_BPS, AdapterError::ConfidenceTooWide);
        storage.feeds.insert(price_feed_id, config);
    }

    #[storage(read, write)]
    fn remove_feed(price_feed_id: PriceFeedId) {
        only_owner();
        let _ = storage.feeds.remove(price_feed_id);
    }

    #[storage(read, write)]
    fn set_stork_contract_id(stork_contract_id: ContractId) {
        only_owner();
        storage.stork_contract_id.write(stork_contract_id);
    }

    #[storage(read, write)]
    fn transfer_ownership(new_owner: Identity) {
        only_owner();
        storage.owner.write(new_owner);
    }

    #[storage(read)]
    fn get_feed(price_feed_id: PriceFeedId) -> Option<FeedConfig> {
        storage.feeds.get(price_feed_id).try_read()
    }

    #[storage(read)]
    fn get_stork_contract_id() -> ContractId {
        storage.stork_contract_id.read()
    }

    #[storage(read)]
    fn owner() -> Identity {
        storage.owner.read()
    }
}

impl PythCore for Contract {
    #[storage(read)]
    fn ema_price(price_feed_id: PriceFeedId) -> Price {
        read_price(price_feed_id)
    }

    // Stork exposes no EMA; the market never calls these, so they mirror spot
    // rather than silently returning a different number.
    #[storage(read)]
    fn ema_price_no_older_than(time_period: u64, price_feed_id: PriceFeedId) -> Price {
        read_price(price_feed_id)
    }

    #[storage(read)]
    fn ema_price_unsafe(price_feed_id: PriceFeedId) -> Price {
        read_price(price_feed_id)
    }

    #[payable, storage(read)]
    fn parse_price_feed_updates(
        max_publish_time: u64,
        min_publish_time: u64,
        price_feed_ids: Vec<PriceFeedId>,
        update_data: Vec<Bytes>,
    ) -> Vec<PriceFeed> {
        let mut out: Vec<PriceFeed> = Vec::new();
        let mut i = 0;
        while i < price_feed_ids.len() {
            let id = price_feed_ids.get(i).unwrap();
            let price = read_price(id);
            out.push(PriceFeed {
                ema_price: price,
                id,
                price,
            });
            i += 1;
        }
        out
    }

    #[storage(read)]
    fn price(price_feed_id: PriceFeedId) -> Price {
        read_price(price_feed_id)
    }

    #[storage(read)]
    fn price_no_older_than(time_period: u64, price_feed_id: PriceFeedId) -> Price {
        read_price(price_feed_id)
    }

    #[storage(read)]
    fn price_unsafe(price_feed_id: PriceFeedId) -> Price {
        read_price(price_feed_id)
    }

    #[storage(read)]
    fn update_fee(update_data: Vec<Bytes>) -> u64 {
        let stork_id = storage.stork_contract_id.read();
        require(stork_id != ContractId::zero(), AdapterError::NotInitialized);
        let stork = abi(Stork, stork_id.bits());
        stork.get_update_fee_v1(decode_updates(update_data))
    }

    #[payable, storage(read, write)]
    fn update_price_feeds(update_data: Vec<Bytes>) {
        forward_updates(update_data);
    }

    #[payable, storage(read, write)]
    fn update_price_feeds_if_necessary(
        price_feed_ids: Vec<PriceFeedId>,
        publish_times: Vec<u64>,
        update_data: Vec<Bytes>,
    ) {
        // Stork already no-ops on updates that are not fresher than stored
        // state, so the "if necessary" filtering happens on its side.
        forward_updates(update_data);
    }

    #[storage(read)]
    fn valid_time_period() -> u64 {
        60
    }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

#[storage(read)]
fn only_owner() {
    require(storage.initialized.read(), AdapterError::NotInitialized);
    require(
        msg_sender()
            .unwrap() == storage
            .owner
            .read(),
        AdapterError::NotOwner,
    );
}

/// Reads a Stork value and presents it in Pyth's shape.
#[storage(read)]
fn read_price(price_feed_id: PriceFeedId) -> Price {
    let config = storage.feeds.get(price_feed_id).try_read();
    require(
        config
            .is_some(),
        AdapterError::FeedNotConfigured(price_feed_id),
    );
    let config = config.unwrap();

    let stork_id = storage.stork_contract_id.read();
    require(stork_id != ContractId::zero(), AdapterError::NotInitialized);
    let stork = abi(Stork, stork_id.bits());
    let value = stork.get_temporal_numeric_value_unchecked_v1(config.stork_id);

    // I128 stores `value + 2^127`, so anything below the indent is negative.
    // A negative price is never valid collateral data - fail loudly rather
    // than wrap around into a huge positive number.
    let underlying = value.quantized_value.underlying();
    let indent = I128::indent();
    require(
        underlying >= indent,
        AdapterError::NegativePrice(price_feed_id),
    );

    let magnitude = underlying - indent;
    let scaled = magnitude / pow10_u128(STORK_DECIMALS - config.exponent);
    let price = match u64::try_from(scaled) {
        Some(v) => v,
        None => revert_overflow(price_feed_id),
    };

    Price {
        confidence: price * config.conf_bps / 10_000,
        exponent: config.exponent,
        price,
        publish_time: value.timestamp_ns / 1_000_000_000 + TAI64_DIFFERENCE,
    }
}

/// Decodes the caller-supplied payload and forwards it to Stork with the fee.
#[storage(read)]
fn forward_updates(update_data: Vec<Bytes>) {
    let inputs = decode_updates(update_data);
    let stork_id = storage.stork_contract_id.read();
    require(stork_id != ContractId::zero(), AdapterError::NotInitialized);
    let stork = abi(Stork, stork_id.bits());
    let fee = stork.get_update_fee_v1(inputs);

    require(
        msg_amount() >= fee && msg_asset_id() == AssetId::base(),
        AdapterError::InvalidPayment,
    );

    stork
        .update_temporal_numeric_values_v1 {
            asset_id: AssetId::base().bits(),
            coins: fee,
        }(inputs);
}

/// Unpacks the wire format the off-chain callers build.
///
/// Each element is exactly `ENCODED_UPDATE_LEN` bytes, big-endian:
///   [0..32)    id
///   [32..40)   timestamp_ns
///   [40..56)   quantized_value, as the raw I128 underlying (value + 2^127)
///   [56..88)   publisher_merkle_root
///   [88..120)  value_compute_alg_hash
///   [120..152) r
///   [152..184) s
///   [184]      v
fn decode_updates(update_data: Vec<Bytes>) -> Vec<TemporalNumericValueInput> {
    let mut out: Vec<TemporalNumericValueInput> = Vec::new();
    let mut i = 0;
    while i < update_data.len() {
        let payload = update_data.get(i).unwrap();
        require(
            payload
                .len() == ENCODED_UPDATE_LEN,
            AdapterError::MalformedUpdateData,
        );

        let quantized = I128::from_uint(U128::from((read_u64(payload, 40), read_u64(payload, 48))));

        out.push(TemporalNumericValueInput {
            temporal_numeric_value: TemporalNumericValue {
                timestamp_ns: read_u64(payload, 32),
                quantized_value: quantized,
            },
            id: read_b256(payload, 0),
            publisher_merkle_root: read_b256(payload, 56),
            value_compute_alg_hash: read_b256(payload, 88),
            r: read_b256(payload, 120),
            s: read_b256(payload, 152),
            v: payload.get(184).unwrap(),
        });
        i += 1;
    }
    out
}

fn read_u64(bytes: Bytes, offset: u64) -> u64 {
    let mut value: u64 = 0;
    let mut i = 0;
    while i < 8 {
        value = (value << 8) | asm(b: bytes.get(offset + i).unwrap()) {
            b: u64
        };
        i += 1;
    }
    value
}

fn read_b256(bytes: Bytes, offset: u64) -> b256 {
    b256::from((
        read_u64(bytes, offset),
        read_u64(bytes, offset + 8),
        read_u64(bytes, offset + 16),
        read_u64(bytes, offset + 24),
    ))
}

fn pow10_u128(exponent: u32) -> U128 {
    let mut result = U128::from((0, 1));
    let ten = U128::from((0, 10));
    let mut i: u32 = 0;
    while i < exponent {
        result = result * ten;
        i += 1;
    }
    result
}

fn revert_overflow(price_feed_id: PriceFeedId) -> u64 {
    require(false, AdapterError::PriceOverflow(price_feed_id));
    0
}
