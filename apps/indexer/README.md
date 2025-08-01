# Indexer

## Hosting:

### Envio hosted service

#### Mainnet

swaylend-usdc-mainnet (v1): https://indexer.hyperindex.xyz/bfc2f60/v1/graphql
swaylend-usdc-mainnet (v2): TODO

#### Testnet

swaylend-usdc-testnet (v2):

### Docker compose

```bash
# The following variables need to be changed
HASURA_GRAPHQL_ENDPOINT: http://localhost:8888/v1/metadata
# And the port in the docker-compose.yml file
8888:8080
```
