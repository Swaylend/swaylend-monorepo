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
    poolAddress = "0x891734bb325148ed28fdc7603e404375c44ee090b66708f45c722ccd702517d5"
  GROUP BY timestamp, chainId, poolAddress
  ORDER BY timestamp asc