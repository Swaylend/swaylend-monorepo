library;

/// This struct contains config details for a specific market
pub struct RewardConfiguration {
    /// Token to use for compounding rewards
    token: AssetId,
    rescale_factor: u64,
    should_upscale: bool,
    multiplier: u256,
}

impl RewardConfiguration {
    pub fn default() -> Self {
        RewardConfiguration {
            token: AssetId::zero(),
            rescale_factor: 0,
            should_upscale: false,
            multiplier: 0,
        }
    }
}

pub struct RewardOwed {
    token: AssetId,
    owed: u256,
}

impl RewardOwed {
    pub fn default() -> Self {
        RewardOwed {
            token: AssetId::zero(),
            owed: 0,
        }
    }
}

pub enum Error {
    AlreadyConfigured: (),
    BadData: (),
    InvalidUInt64: (),
    NotPermitted: (),
    NotSupported: (),
    TransferOutFailed: (),
}
