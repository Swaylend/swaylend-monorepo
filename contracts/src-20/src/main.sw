// ERC20 equivalent in Sway.
contract;
 
use standards::src3::SRC3;
use standards::src5::{SRC5, State, AccessError};
use standards::src20::SRC20;
use std::{
    asset::{
        burn,
        mint_to,
    },
    call_frames::msg_asset_id,
    constants::DEFAULT_SUB_ID,
    context::msg_amount,
    string::String,
};
 
configurable {
    DECIMALS: u8 = 9u8,
    NAME: str[8] = __to_str_array("SwayLend"),
    SYMBOL: str[5] = __to_str_array("SLEND"),
    MAX_SUPPLY: u64 = 1_000_000_000_000_000_000u64, // 1 billion
}
 
storage {
    total_supply: u64 = 0,
    owner: State = State::Uninitialized,
}

abi SingleAsset {
    #[storage(read, write)]
    fn constructor(owner_: Identity);

    fn max_supply(asset: AssetId) -> Option<u64>;

    fn asset_id() -> AssetId;
}
 
impl SingleAsset for Contract {
    #[storage(read, write)]
    fn constructor(owner_: Identity) {
        require(storage.owner.read() == State::Uninitialized, "owner-initialized");
        storage.owner.write(State::Initialized(owner_));
    }

    fn max_supply(asset: AssetId) -> Option<u64> {
        if asset == AssetId::default() {
            Some(MAX_SUPPLY)
        } else {
            None
        }
    }

    fn asset_id() -> AssetId {
        AssetId::default()
    }
}
 
// Native Asset Standard
impl SRC20 for Contract {
    #[storage(read)]
    fn total_assets() -> u64 {
        1_u64
    }
 
    #[storage(read)]
    fn total_supply(asset: AssetId) -> Option<u64> {
        if asset == AssetId::default() {
            Some(storage.total_supply.read())
        } else {
            None
        }
    }
 
    #[storage(read)]
    fn name(asset: AssetId) -> Option<String> {
        if asset == AssetId::default() {
            Some(String::from_ascii_str(from_str_array(NAME)))
        } else {
            None
        }
    }
 
    #[storage(read)]
    fn symbol(asset: AssetId) -> Option<String> {
        if asset == AssetId::default() {
            Some(String::from_ascii_str(from_str_array(SYMBOL)))
        } else {
            None
        }
    }
 
    #[storage(read)]
    fn decimals(asset: AssetId) -> Option<u8> {
        if asset == AssetId::default() {
            Some(DECIMALS)
        } else {
            None
        }
    }
}
 
// Ownership Standard
impl SRC5 for Contract {
    #[storage(read)]
    fn owner() -> State {
        storage.owner.read()
    }
}
 
// Mint and Burn Standard
impl SRC3 for Contract {
    #[storage(read, write)]
    fn mint(recipient: Identity, sub_id: SubId, amount: u64) {
        require(sub_id == DEFAULT_SUB_ID, "incorrect-sub-id");
        require(
            storage.owner.read() == State::Initialized(msg_sender().unwrap()),
            AccessError::NotOwner,
        );
        require(storage.total_supply.read() + amount <= MAX_SUPPLY, "max-supply-reached");
 
        storage
            .total_supply
            .write(amount + storage.total_supply.read());
        mint_to(recipient, DEFAULT_SUB_ID, amount);
    }
 
    #[payable]
    #[storage(read, write)]
    fn burn(sub_id: SubId, amount: u64) {
        require(sub_id == DEFAULT_SUB_ID, "incorrect-sub-id");
        require(msg_amount() >= amount, "incorrect-amount-provided");
        require(
            msg_asset_id() == AssetId::default(),
            "incorrect-asset-provided",
        );
 
        storage
            .total_supply
            .write(storage.total_supply.read() - amount);
        burn(DEFAULT_SUB_ID, amount);
    }
}
