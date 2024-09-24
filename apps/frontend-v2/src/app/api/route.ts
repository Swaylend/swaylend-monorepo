import type { NextRequest } from 'next/server';

export const revalidate = 60; // revalidate at most every 1 minute

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const poolAddress = searchParams.get('poolAddress');

  if (!poolAddress) {
    return Response.json(
      { error: 'Pool address is required' },
      { status: 400 }
    );
  }

  try {
    const url =
      'https://app.sentio.xyz/api/v1/analytics/martines3000/swaylend/sql/execute';
    const apiKey = 'Cgi0iQHZxY68d9XqLgEJhdj6ZV0vdkXU6';

    // GET SUPPLIED VALUE USD, BORROWED VALUE USD timestamped in 1 call
    const data = {
      sqlQuery: {
        sql: `
          SELECT 
              timestamp,
              FLOOR(SUM(suppliedAmountUsd)) as suppliedValueUsd,
          FLOOR(SUM(borrowedAmountUsd)) as borrowedValueUsd,
              ROUND(argMax(supplyApr, timestamp), 2) as supplyApr,
              ROUND(argMax(borrowApr, timestamp), 2) as borrowApr
          FROM \`BasePoolSnapshot_raw\`
          WHERE 
              chainId = 0 
              AND 
              poolAddress = "${poolAddress}"
          GROUP BY timestamp, chainId, poolAddress
          ORDER BY timestamp asc
        `,
        size: 10000,
      },
    };

    // GET COLLATERAL VALUE USD timestamped in 1 call
    const data1 = {
      sqlQuery: {
        sql: `
          SELECT 
              timestamp,
              FLOOR(SUM(collateralAmountUsd)) as collateralValueUsd
          FROM \`CollateralPoolSnapshot_raw\`
          WHERE 
              chainId = 0 
              AND 
              poolAddress = "${poolAddress}"
          GROUP BY timestamp, chainId, poolAddress
          ORDER BY timestamp asc
        `,
        size: 10000,
      },
    };

    // GET SUPPLIED VALUE USD, COLLATERAL VALUE USD, BORROWED VALUE USD timestamped in 1 call
    const data2 = {
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data2),
      next: { revalidate },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to get sentio data' },
        { status: 500 }
      );
    }

    const jsonResponse = await response.json();

    if (!jsonResponse) {
      return Response.json(
        { error: 'Failed to get sentio data' },
        {
          status: 500,
        }
      );
    }

    return Response.json({ success: true, data: jsonResponse.result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Failed to get sentio data' },
      { status: 500 }
    );
  }
}
