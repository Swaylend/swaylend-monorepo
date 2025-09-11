use fuels::types::SubAssetId;
use sha2::{Digest, Sha256};

pub fn get_symbol_sub_asset_id(symbol: &str) -> SubAssetId {
    let mut hasher = Sha256::new();
    hasher.update(symbol);
    let symbol_hash: [u8; 32] = hasher.finalize().into();

    SubAssetId::new(symbol_hash)
}
