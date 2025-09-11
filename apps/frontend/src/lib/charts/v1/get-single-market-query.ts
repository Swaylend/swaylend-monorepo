import { appConfig } from '@/configs';

export const getSingleMarketQuery = (poolAddress: string) => `
WITH CollateralPoolData AS (
    select date,
        FLOOR(SUM(collateralValueUsd)) as collateralValueUsd
    from (
            SELECT DATE(timestamp) as date,
                argMax(collateralAmountUsd, timestamp) as collateralValueUsd
            FROM CollateralPoolSnapshot_raw
            WHERE chainId = ${appConfig.env === 'testnet' ? 0 : 9889}
                AND poolAddress = '${poolAddress}'
                AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
                AND timestamp < toStartOfDay(NOW())
            GROUP BY date,
                underlyingTokenAddress
        )
    group by date
    UNION ALL
    select date,
        FLOOR(SUM(collateralValueUsd)) as collateralValueUsd
    from (
            SELECT DATE(NOW()) as date,
                collateralAmountUsd as collateralValueUsd
            FROM CollateralPool
            WHERE chainId = ${appConfig.env === 'testnet' ? 0 : 9889}
                AND poolAddress = '${poolAddress}'
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
    WHERE chainId = ${appConfig.env === 'testnet' ? 0 : 9889}
        AND poolAddress = '${poolAddress}'
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        AND timestamp < toStartOfDay(NOW())
    GROUP BY date
    UNION ALL
    SELECT DATE(NOW()) as date,
        FLOOR(suppliedAmountUsd) as suppliedValueUsd,
        FLOOR(borrowedAmountUsd) as borrowedValueUsd,
        ROUND(supplyApr, 2) as supplyApr,
        ROUND(borrowApr, 2) as borrowApr
    FROM BasePool
    WHERE chainId = ${appConfig.env === 'testnet' ? 0 : 9889}
        AND poolAddress = '${poolAddress}'
)
SELECT toUnixTimestamp(COALESCE(c.date, b.date)) as timestamp,
    coalesce(c.collateralValueUsd, 0) as collateralValueUsd,
    coalesce(b.suppliedValueUsd, 0) as suppliedValueUsd,
    coalesce(b.borrowedValueUsd, 0) as borrowedValueUsd,
    coalesce(b.supplyApr, 0) as supplyApr,
    coalesce(b.borrowApr, 0) as borrowApr
FROM CollateralPoolData c
    FULL OUTER JOIN BasePoolData b ON c.date = b.date
ORDER BY timestamp ASC WITH FILL
FROM toUnixTimestamp(toDate(DATE_SUB(NOW(), INTERVAL 1 MONTH))) TO toUnixTimestamp(toDate(NOW())) STEP 86400
`;
