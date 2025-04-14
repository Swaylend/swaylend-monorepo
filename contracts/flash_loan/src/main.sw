contract;

use flashloan_abi::FlashLoaner;

impl FlashLoaner for Contract {
    #[storage(read)]
    fn execute_operation(amount: u64, initiator: Identity, data: Vec<u8>) -> bool {
        true
    }
}
