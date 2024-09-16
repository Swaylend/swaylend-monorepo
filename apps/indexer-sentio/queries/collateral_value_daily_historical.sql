SELECT 
    DATE(timestamp) as date,
    FLOOR(AVG(collateralAmountUsd)) as collateralValueUsd
FROM `CollateralPoolSnapshot_raw`
WHERE 
    chainId = 0 
    AND 
    poolAddress = "0x66a64bffe98195ab13162b5f478bf5e1fa938631df2e845c29e3839727c41293"
GROUP BY date, chainId, poolAddress
ORDER BY date asc