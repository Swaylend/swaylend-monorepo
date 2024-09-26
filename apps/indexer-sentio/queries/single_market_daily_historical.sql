WITH CollateralPoolData AS (
    SELECT 
        DATE(timestamp) as date,
        FLOOR(AVG(collateralAmountUsd)) as collateralValueUsd
    FROM CollateralPoolSnapshot_raw
    WHERE 
        chainId = 0 
        AND 
        poolAddress = '0x0891579ef65509eeba9c66742931cc21218cdb93dd2239dfec794e9d57f87286'
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    GROUP BY date, chainId, poolAddress
),
BasePoolData AS (
    SELECT 
        DATE(timestamp) as date,
        FLOOR(AVG(suppliedAmountUsd)) as suppliedValueUsd,
        FLOOR(AVG(borrowedAmountUsd)) as borrowedValueUsd,
        ROUND(AVG(supplyApr), 2) as supplyApr,
        ROUND(AVG(borrowApr), 2) as borrowApr
    FROM BasePoolSnapshot_raw
    WHERE 
        chainId = 0 
        AND 
        poolAddress = '0x0891579ef65509eeba9c66742931cc21218cdb93dd2239dfec794e9d57f87286'
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    GROUP BY date, chainId, poolAddress
)
SELECT 
    toUnixTimestamp(COALESCE(c.date, b.date)) as timestamp,
    c.collateralValueUsd,
    b.suppliedValueUsd,
    b.borrowedValueUsd,
    b.supplyApr,
    b.borrowApr
FROM CollateralPoolData c
FULL OUTER JOIN BasePoolData b ON c.date = b.date
ORDER BY timestamp ASC