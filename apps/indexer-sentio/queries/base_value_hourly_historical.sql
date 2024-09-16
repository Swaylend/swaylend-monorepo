SELECT 
    timestamp,
    FLOOR(SUM(suppliedAmountUsd)) as suppliedValueUsd,
    FLOOR(SUM(borrowedAmountUsd)) as borrowedValueUsd,
    ROUND(argMax(supplyApr, timestamp), 2) as supplyApr,
    ROUND(argMax(borrowApr, timestamp), 2) as borrowApr
  FROM `BasePoolSnapshot_raw`
  WHERE 
    chainId = 0 
    AND 
    poolAddress = "0x66a64bffe98195ab13162b5f478bf5e1fa938631df2e845c29e3839727c41293"
  GROUP BY timestamp, chainId, poolAddress
  ORDER BY timestamp asc