export function removeDuplicatesByProperty(arr: any[], prop: string) {
  const seen = new Set();
  return arr.filter((item) => {
    if (!seen.has(item[prop])) {
      seen.add(item[prop]);
      return true;
    }
    return false;
  });
}

export function getChartQuery(poolAddress: string) {
  if (!poolAddress) return null;
  return {
    sqlQuery: {
      sql: `
        SELECT 
          COALESCE(a.timestamp, b.timestamp) AS timestamp,
          COALESCE(a.suppliedValueUsd, 0) AS suppliedValueUsd,
          COALESCE(b.collateralValueUsd, 0) AS collateralValueUsd,
          COALESCE(a.borrowedValueUsd, 0) AS borrowedValueUsd
          FROM (
              SELECT 
              timestamp,
              FLOOR(SUM(suppliedAmountUsd)) AS suppliedValueUsd,
              NULL AS collateralValueUsd,
              FLOOR(SUM(borrowedAmountUsd)) AS borrowedValueUsd
          FROM \`BasePoolSnapshot_raw\`
          WHERE 
              chainId = 0 
              AND 
              poolAddress = "${poolAddress}"
          GROUP BY timestamp, chainId, poolAddress
          ) a
          LEFT JOIN (
              SELECT 
                timestamp,
              NULL AS suppliedValueUsd,
              FLOOR(SUM(collateralAmountUsd)) AS collateralValueUsd,
              NULL AS borrowedValueUsd
          FROM \`CollateralPoolSnapshot_raw\`
          WHERE 
              chainId = 0 
              AND 
              poolAddress = "${poolAddress}"
          GROUP BY timestamp, chainId, poolAddress
          ) b
          ON a.timestamp = b.timestamp

          UNION ALL

          SELECT 
              COALESCE(a.timestamp, b.timestamp) AS timestamp,
              COALESCE(a.suppliedValueUsd, 0) AS suppliedValueUsd,
              COALESCE(b.collateralValueUsd, 0) AS collateralValueUsd,
              COALESCE(a.borrowedValueUsd, 0) AS borrowedValueUsd
          FROM (
                  SELECT 
              timestamp,
              FLOOR(SUM(suppliedAmountUsd)) AS suppliedValueUsd,
              NULL AS collateralValueUsd,
              FLOOR(SUM(borrowedAmountUsd)) AS borrowedValueUsd
          FROM \`BasePoolSnapshot_raw\`
          WHERE 
              chainId = 0 
              AND 
              poolAddress = "${poolAddress}"
          GROUP BY timestamp, chainId, poolAddress
          ) a
          RIGHT JOIN (
              SELECT 
                  timestamp,
              FLOOR(SUM(collateralAmountUsd)) AS collateralValueUsd,
              NULL AS suppliedValueUsd,
              NULL AS borrowedValueUsd
          FROM \`CollateralPoolSnapshot_raw\`
          WHERE 
              chainId = 0 
              AND 
              poolAddress = "${poolAddress}"
              GROUP BY timestamp, chainId, poolAddress
          ) b
          ON a.timestamp = b.timestamp
          ORDER BY timestamp ASC;
      `,
      size: 10000,
    },
  };
}
