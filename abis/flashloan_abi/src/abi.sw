library;

abi FlashLoaner {
    #[storage(read)]
    fn execute_operation(amount: u64, initiator: Identity, data: Vec<u8>) -> bool;
    #[storage(read)]
    fn price();
}
