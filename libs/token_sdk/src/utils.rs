use fuels::types::{AssetId, Bits256};
use sha2::{Digest, Sha256};

pub fn get_symbol_hash(symbol: &str) -> Bits256 {
    let mut hasher = Sha256::new();
    hasher.update(symbol);
    let symbol_hash: [u8; 32] = hasher.finalize().into();
    let hash_asset_id = AssetId::from(symbol_hash);
    Bits256::from(hash_asset_id)
}
