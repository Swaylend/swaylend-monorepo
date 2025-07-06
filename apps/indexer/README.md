# Indexer


### Supported queries
#### Main queries

- Get all collateral assets
- Get all users (UserBasic information)
    - Get historical information (collateralEvents, baseEvents, liquidationEvents, absorbCollateralEvents, buyCollateralEvents)
    - Get total collateral value that this user bough
    - Get total value that this user liquidated (as liquidator)
- Get Market information
- Get all collaterals users have deposited (this is updated by `UserSupplyCollateralEvent`, `UserWithdrawCollateralEvent` and `AbsorbCollateralEvent`)

#### Analytical queries
- Get all user collateral interactions (supply, withdraw)
- Get all user base events (deposit, withdraw, borrow, repay)
- Get all liquidation events
- Get all absorb collateral events
- Get all buy collateral events
- Get all reserves withdrawn events

## Hosting:

### Envio hosted service

Current version endpoint: https://indexer.hyperindex.xyz/bfc2f60/v1/graphql

Second market endpoint: TODO

### Docker compose

```bash
# The following variables need to be changed
HASURA_GRAPHQL_ENDPOINT: http://localhost:8888/v1/metadata
# And the port in the docker-compose.yml file
8888:8080
```
