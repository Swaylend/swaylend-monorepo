SELECT 
    chainId as chain_id,
    creationBlockNumber as creation_block_number,
    creationTimestamp as creation_timestamp,
    underlyingTokenAddress as underlying_token_address,
    underlyingTokenSymbol as underlying_token_symbol,
    receiptTokenAddress as receipt_token_address,
    receiptTokenSymbol as receipt_token_symbol,
    poolAddress as pool_address,
    poolType as pool_type
FROM
    `Pool`