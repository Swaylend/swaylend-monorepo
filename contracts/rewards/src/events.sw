library;


pub struct GovernorTransferred {
    pub old_governor: Identity,
    pub new_governor: Identity,
}

pub struct RewardsClaimedSet {
    pub user: Identity,
    pub market: ContractId,
    pub amount: u256,
}

pub struct RewardsClaimed {
    pub src: Identity,
    pub recipient: Identity,
    pub token: AssetId,
    pub amount: u256,
}
