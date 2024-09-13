SELECT *
FROM (
        SELECT id,
            timestamp,
            argMax (blockDate, timestamp) as block_date,
            argMax (chainId, timestamp) as chain_id,
            argMax (poolAddress, timestamp) as pool_address,
            argMax (underlyingTokenAddress, timestamp) as underlying_token_address,
            argMax (underlyingTokenSymbol, timestamp) as underlying_token_symbol,
            argMax (underlyingTokenPriceUsd, timestamp) as underlying_token_price_usd,
            argMax (availableAmount, timestamp) as available_amount,
            argMax (availableAmountUsd, timestamp) as available_amount_usd,
            argMax (suppliedAmount, timestamp) as supplied_amount,
            argMax (suppliedAmountUsd, timestamp) as supplied_amount_usd,
            argMax (nonRecursiveSuppliedAmount, timestamp) as non_recursive_supplied_amount,
            argMax (collateralAmount, timestamp) as collateral_amount,
            argMax (collateralAmountUsd, timestamp) as collateral_amount_usd,
            argMax (collateralFactor, timestamp) as collateral_factor,
            argMax (supplyIndex, timestamp) as supply_index,
            argMax (supplyApr, timestamp) as supply_apr,
            argMax (borrowedAmount, timestamp) as borrowed_amount,
            argMax (borrowedAmountUsd, timestamp) as borrowed_amount_usd,
            argMax (borrowIndex, timestamp) as borrow_index,
            argMax (borrowApr, timestamp) as borrow_apr
        FROM `CollateralPoolSnapshot_raw`
        WHERE timestamp > toUnixTimestamp('2024-09-01 23:00:00')
        GROUP BY id,
            timestamp
        UNION ALL
        SELECT id,
            timestamp,
            argMax (blockDate, timestamp) as block_date,
            argMax (chainId, timestamp) as chain_id,
            argMax (poolAddress, timestamp) as pool_address,
            argMax (underlyingTokenAddress, timestamp) as underlying_token_address,
            argMax (underlyingTokenSymbol, timestamp) as underlying_token_symbol,
            argMax (underlyingTokenPriceUsd, timestamp) as underlying_token_price_usd,
            argMax (availableAmount, timestamp) as available_amount,
            argMax (availableAmountUsd, timestamp) as available_amount_usd,
            argMax (suppliedAmount, timestamp) as supplied_amount,
            argMax (suppliedAmountUsd, timestamp) as supplied_amount_usd,
            argMax (nonRecursiveSuppliedAmount, timestamp) as non_recursive_supplied_amount,
            argMax (collateralAmount, timestamp) as collateral_amount,
            argMax (collateralAmountUsd, timestamp) as collateral_amount_usd,
            argMax (collateralFactor, timestamp) as collateral_factor,
            argMax (supplyIndex, timestamp) as supply_index,
            argMax (supplyApr, timestamp) as supply_apr,
            argMax (borrowedAmount, timestamp) as borrowed_amount,
            argMax (borrowedAmountUsd, timestamp) as borrowed_amount_usd,
            argMax (borrowIndex, timestamp) as borrow_index,
            argMax (borrowApr, timestamp) as borrow_apr
        FROM `BasePoolSnapshot_raw`
        WHERE timestamp > toUnixTimestamp('2024-09-01 23:00:00')
        GROUP BY id,
            timestamp
    )
ORDER BY timestamp ASC,
    id