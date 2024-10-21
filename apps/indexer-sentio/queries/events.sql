SELECT timestamp,
    chainId as chain_id,
    blockNumber as block_number,
    logIndex as log_index,
    transactionHash as transaction_hash,
    userAddress as user_address,
    takerAddress as taker_address,
    poolAddress as pool_address,
    tokenAddress as token_address,
    amountNormalized as amount,
    amountUsd,
    eventType as event_type
FROM `EventEntity`
WHERE timestamp > timestamp('{{timestamp}}')
ORDER BY timestamp asc