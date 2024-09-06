SELECT
    argMax (toUnixTimestamp(__genBlockTime__), __genBlockTime__) as timestamp,
    -- TODO: block_date: YYYY-MM-DD HH:00:00
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
from
  `PositionSnapshot_raw`
where
  __genBlockTime__ <= '2024-09-06 23:00:00'
group by
  id
