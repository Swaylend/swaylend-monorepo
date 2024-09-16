SELECT 
    timestamp,
    FLOOR(SUM(collateralAmountUsd)) as collateralValueUsd
FROM `CollateralPoolSnapshot_raw`
WHERE 
    chainId = 0 
    AND 
    poolAddress = "0x891734bb325148ed28fdc7603e404375c44ee090b66708f45c722ccd702517d5"
GROUP BY timestamp, chainId, poolAddress
ORDER BY timestamp asc