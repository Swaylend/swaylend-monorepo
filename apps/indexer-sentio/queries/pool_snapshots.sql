SELECT
   timestamp,
   blockDate as block_date,
   chainId as chain_id,
   poolAddress as pool_address,
   underlyingTokenAddress as underlying_token_address,
   underlyingTokenSymbol as underlying_token_symbol,
   underlyingTokenPriceUsd as underlying_token_price_usd,
   availableAmount as available_amount,
   availableAmountUsd as available_amount_usd,
   suppliedAmount as supplied_amount,
   suppliedAmountUsd as supplied_amount_usd,
   nonRecursiveSuppliedAmount as non_recursive_supplied_amount,
   collateralAmount as collateral_amount,
   collateralAmountUsd as collateral_amount_usd,
   collateralFactor as collateral_factor,
   supplyIndex as supply_index,
   supplyApr as supply_apr,
   borrowedAmount as borrowed_amount,
   borrowedAmountUsd as borrowed_amount_usd,
   borrowIndex as borrow_index,
   borrowApr as borrow_apr
FROM
   `BasePoolSnapshot_raw`
WHERE
    blockDate == '2024-09-11 23:00:00'

UNION ALL

SELECT
    1726095600 as timestamp,
    '2024-09-11 23:00:00' as block_date,
    argMax (chainId, __genBlockTime__) as chain_id,
    argMax (poolAddress, __genBlockTime__) as pool_address,
    argMax (underlyingTokenAddress, __genBlockTime__) as underlying_token_address,
    argMax (underlyingTokenSymbol, __genBlockTime__) as underlying_token_symbol,
    argMax (underlyingTokenPriceUsd, __genBlockTime__) as underlying_token_price_usd,
    argMax (availableAmount, __genBlockTime__) as available_amount,
    argMax (availableAmountUsd, __genBlockTime__) as available_amount_usd,
    argMax (suppliedAmount, __genBlockTime__) as supplied_amount,
    argMax (suppliedAmountUsd, __genBlockTime__) as supplied_amount_usd,
    argMax (nonRecursiveSuppliedAmount, __genBlockTime__) as non_recursive_supplied_amount,
    argMax (collateralAmount, __genBlockTime__) as collateral_amount,
    argMax (collateralAmountUsd, __genBlockTime__) as collateral_amount_usd,
    argMax (collateralFactor, __genBlockTime__) as collateral_factor,
    argMax (supplyIndex, __genBlockTime__) as supply_index,
    argMax (supplyApr, __genBlockTime__) as supply_apr,
    argMax (borrowedAmount, __genBlockTime__) as borrowed_amount,
    argMax (borrowedAmountUsd, __genBlockTime__) as borrowed_amount_usd,
    argMax (borrowIndex, __genBlockTime__) as borrow_index,
    argMax (borrowApr, __genBlockTime__) as borrow_apr
FROM
   `CollateralPoolSnapshot_raw`
WHERE
    __genBlockTime__ <= '2024-09-11 23:00:00'
GROUP BY
    id