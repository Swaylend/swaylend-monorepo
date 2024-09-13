SELECT *
FROM (
        SELECT id,
            timestamp,
            argMax(blockDate, timestamp) as block_date,
            argMax(chainId, timestamp) as chain_id,
            argMax(poolAddress, timestamp) as pool_address,
            argMax(
                underlyingTokenAddress,
                timestamp
            ) as underlying_token_address,
            argMax(underlyingTokenSymbol, timestamp) as underlying_token_symbol,
            argMax(userAddress, timestamp) as user_address,
            argMax(suppliedAmount, timestamp) as supplied_amount,
            argMax(suppliedAmountUsd, timestamp) as supplied_amount_usd,
            argMax(borrowedAmount, timestamp) as borrowed_amount,
            argMax(borrowedAmountUsd, timestamp) as borrowed_amount_usd,
            argMax(collateralAmount, timestamp) as collateral_amount,
            argMax(collateralAmountUsd, timestamp) as collateral_amount_usd
        FROM `BasePositionSnapshot_raw`
        WHERE timestamp > toUnixTimestamp('2024-09-01 23:00:00')
        GROUP BY id,
            timestamp
        UNION ALL
        SELECT id,
            timestamp,
            argMax(blockDate, timestamp) as block_date,
            argMax(chainId, timestamp) as chain_id,
            argMax(poolAddress, timestamp) as pool_address,
            argMax(
                underlyingTokenAddress,
                timestamp
            ) as underlying_token_address,
            argMax(underlyingTokenSymbol, timestamp) as underlying_token_symbol,
            argMax(userAddress, timestamp) as user_address,
            argMax(suppliedAmount, timestamp) as supplied_amount,
            argMax(suppliedAmountUsd, timestamp) as supplied_amount_usd,
            argMax(borrowedAmount, timestamp) as borrowed_amount,
            argMax(borrowedAmountUsd, timestamp) as borrowed_amount_usd,
            argMax(collateralAmount, timestamp) as collateral_amount,
            argMax(collateralAmountUsd, timestamp) as collateral_amount_usd
        FROM `CollateralPositionSnapshot_raw`
        WHERE timestamp > toUnixTimestamp('2024-09-01 23:00:00')
        GROUP BY id,
            timestamp
    )
ORDER BY timestamp ASC,
    id