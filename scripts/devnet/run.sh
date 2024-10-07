#!/bin/sh

# start local devnet
fuel-core --version
fuel-core run --db-type in-memory --debug --snapshot ./chain_config --ip 0.0.0.0
