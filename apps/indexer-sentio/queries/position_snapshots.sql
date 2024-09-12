SELECT
    timestamp,
    blockDate as block_date,
    chainId as chain_id,
    poolAddress as pool_address,
    underlyingTokenAddress as underlying_token_address,
    underlyingTokenSymbol as underlying_token_symbol,
    userAddress as user_address,
    suppliedAmount as supplied_amount,
    suppliedAmountUsd as supplied_amount_usd,
    borrowedAmount as borrowed_amount,
    borrowedAmountUsd as borrowed_amount_usd,
    collateralAmount as collateral_amount,
    collateralAmountUsd as collateral_amount_usd
FROM
    `BasePositionSnapshot_raw`
WHERE
    blockDate == '2024-09-09 17:00:00'

UNION ALL

SELECT
    1725901200 as timestamp,
    '2024-09-09 17:00:00' as block_date,
    argMax (chainId, __genBlockTime__) as chain_id,
    argMax (poolAddress, __genBlockTime__) as pool_address,
    argMax (underlyingTokenAddress, __genBlockTime__) as underlying_token_address,
    argMax (underlyingTokenSymbol, __genBlockTime__) as underlying_token_symbol,
    argMax (userAddress, __genBlockTime__) as user_address,
    argMax (suppliedAmount, __genBlockTime__) as supplied_amount,
    argMax (suppliedAmountUsd, __genBlockTime__) as supplied_amount_usd,
    argMax (borrowedAmount, __genBlockTime__) as borrowed_amount,
    argMax (borrowedAmountUsd, __genBlockTime__) as borrowed_amount_usd,
    argMax (collateralAmount, __genBlockTime__) as collateral_amount,
    argMax (collateralAmountUsd, __genBlockTime__) as collateral_amount_usd
FROM
    `CollateralPositionSnapshot_raw`
WHERE
    __genBlockTime__ <= '2024-09-09 17:00:00'
GROUP BY
    id

