contract;

abi Test {
    #[storage(read, write)]
    fn increment(amount: u64);

    #[storage(read)]
    fn get() -> u64;
}

storage {
    counter: u64 = 0,
}

impl Test for Contract {
    #[storage(read, write)]
    fn increment(amount: u64) {
        let incremented = storage.counter.read() + amount;
        storage.counter.write(incremented);
    }

    #[storage(read)]
    fn get() -> u64 {
        storage.counter.read()
    }
}