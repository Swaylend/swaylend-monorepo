SELECT timestamp,
    blockDate as block_date,
    chainId as chain_id,
    poolAddress as pool_address,
    underlyingTokenAddress as underlying_token_address,
    underlyingTokenSymbol as underlying_token_symbol,
    userAddress as user_address,
    suppliedAmountNormalized as supplied_amount,
    suppliedAmountUsd as supplied_amount_usd,
    borrowedAmountNormalized as borrowed_amount,
    borrowedAmountUsd as borrowed_amount_usd,
    collateralAmountNormalized as collateral_amount,
    collateralAmountUsd as collateral_amount_usd
FROM `BasePositionSnapshot_raw`
WHERE timestamp > timestamp('{{timestamp}}')
UNION ALL
SELECT timestamp,
    blockDate as block_date,
    chainId as chain_id,
    poolAddress as pool_address,
    underlyingTokenAddress as underlying_token_address,
    underlyingTokenSymbol as underlying_token_symbol,
    userAddress as user_address,
    suppliedAmountNormalized as supplied_amount,
    suppliedAmountUsd as supplied_amount_usd,
    borrowedAmountNormalized as borrowed_amount,
    borrowedAmountUsd as borrowed_amount_usd,
    collateralAmountNormalized as collateral_amount,
    collateralAmountUsd as collateral_amount_usd
FROM `CollateralPositionSnapshot_raw`
WHERE timestamp > timestamp('{{timestamp}}')