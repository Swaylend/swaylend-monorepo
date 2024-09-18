SELECT 
    DATE(timestamp) as date,
    FLOOR(AVG(suppliedAmountUsd)) as suppliedValueUsd,
    FLOOR(AVG(borrowedAmountUsd)) as borrowedValueUsd,
    ROUND(AVG(supplyApr), 2) as supplyApr,
    ROUND(AVG(borrowApr), 2) as borrowApr
  FROM `BasePoolSnapshot_raw`
  WHERE 
    chainId = 0 
    AND 
    poolAddress = "0x66a64bffe98195ab13162b5f478bf5e1fa938631df2e845c29e3839727c41293"
  GROUP BY date, chainId, poolAddress
  ORDER BY date asc