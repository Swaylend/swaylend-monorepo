/*
    REQUIRED OUTPUT SCHEMA
    chain_id: number
    creation_block_number: number
    creation_timestamp: number
    underlying_token_address: string
    underlying_token_symbol: string
    receipt_token_address: string
    receipt_token_symbol: string
    pool_address: string
    pool_type: string
*/
SELECT 
    0 as chain_id,
    block_number as creation_block_number,
    timestamp as creation_timestamp,
    data.market_config.base_token AS underlying_token_address,
    "USDC" as underlying_token_symbol,
    "" as receipt_token_address,
    "" as receipt_token_symbol,
    address as pool_address,
    "collateral_only" as pool_type
FROM `MarketConfiguration`
ORDER BY timestamp ASC
LIMIT 1