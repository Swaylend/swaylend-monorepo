# Swaylend Protocol Contracts

The core components of the Swaylend protocol are located here. The protocol implementation resides in [`main.sw`](src/main.sw).

## Building contracts

To build the contracts, run the following commands in the project root:

```bash
forc build
forc build --release
```

## Testing contracts

We use the release build for our tests. To run the tests, execute:

```bash
cargo test --release local_tests -- --nocapture
```

If you don't want to see all the standard output and only want to see the test results, omit the `--nocapture` flag from the command above.
