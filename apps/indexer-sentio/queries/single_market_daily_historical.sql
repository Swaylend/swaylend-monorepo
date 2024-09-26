WITH CollateralPoolData AS (
    select date,
        FLOOR(SUM(collateralValueUsd)) as collateralValueUsd
    from (
            SELECT DATE(timestamp) as date,
                argMax(collateralAmountUsd, timestamp) as collateralValueUsd
            FROM CollateralPoolSnapshot_raw
            WHERE chainId = 0
                AND poolAddress = '0x689bfaf54edfc433f62d06f3581998f9cb32ce864da5ff99f4be7bed3556529d'
                AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            GROUP BY date,
                underlyingTokenAddress
        )
    group by date
),
BasePoolData AS (
    SELECT DATE(timestamp) as date,
        FLOOR(argMax(suppliedAmountUsd, timestamp)) as suppliedValueUsd,
        FLOOR(argMax(borrowedAmountUsd, timestamp)) as borrowedValueUsd,
        ROUND(argMax(supplyApr, timestamp), 2) as supplyApr,
        ROUND(argMax(borrowApr, timestamp), 2) as borrowApr
    FROM BasePoolSnapshot_raw
    WHERE chainId = 0
        AND poolAddress = '0x689bfaf54edfc433f62d06f3581998f9cb32ce864da5ff99f4be7bed3556529d'
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    GROUP BY date
)
SELECT toUnixTimestamp(COALESCE(c.date, b.date)) as timestamp,
    c.collateralValueUsd,
    b.suppliedValueUsd,
    b.borrowedValueUsd,
    b.supplyApr,
    b.borrowApr
FROM CollateralPoolData c
    FULL OUTER JOIN BasePoolData b ON c.date = b.date
ORDER BY timestamp ASC