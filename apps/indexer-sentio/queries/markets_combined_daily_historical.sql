WITH CollateralPoolData AS (
    select date,
        FLOOR(SUM(collateralValueUsd)) as collateralValueUsd
    from (
            SELECT poolAddress,
                DATE(timestamp) as date,
                FLOOR(AVG(collateralAmountUsd)) as collateralValueUsd
            FROM CollateralPoolSnapshot_raw
            WHERE chainId = 0
                AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            GROUP BY date,
                poolAddress
        )
    group by date
),
BasePoolData AS (
    select date,
        FLOOR(SUM(suppliedValueUsd)) as suppliedValueUsd,
        FLOOR(SUM(borrowedValueUsd)) as borrowedValueUsd
    from (
            SELECT poolAddress,
                DATE(timestamp) as date,
                AVG(suppliedAmountUsd) as suppliedValueUsd,
                AVG(borrowedAmountUsd) as borrowedValueUsd
            FROM BasePoolSnapshot_raw
            WHERE chainId = 0
                AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            GROUP BY date,
                poolAddress
        )
    group by date
)
SELECT toUnixTimestamp(COALESCE(c.date, b.date)) as timestamp,
    c.collateralValueUsd,
    b.suppliedValueUsd,
    b.borrowedValueUsd
FROM CollateralPoolData c
    FULL OUTER JOIN BasePoolData b ON c.date = b.date
ORDER BY timestamp ASC