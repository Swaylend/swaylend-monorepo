SELECT 
    timestamp,
    FLOOR(SUM(collateralAmountUsd)) as collateralValueUsd
FROM `CollateralPoolSnapshot_raw`
WHERE 
    chainId = 0 
    AND 
    poolAddress = "0x66a64bffe98195ab13162b5f478bf5e1fa938631df2e845c29e3839727c41293"
GROUP BY timestamp, chainId, poolAddress
ORDER BY timestamp asc