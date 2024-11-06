with tokens as (
    SELECT arrayJoin(['ETH']) as token
),
user_position as (
    SELECT 
        userAddress as user,
        poolAddress as pool,
        borrowedAmountUsd
    FROM `BasePositionSnapshot`
    WHERE borrowedAmountUsd > 0
),
user_collateral_positions as (
    SELECT 
        CollateralPositionSnapshot.userAddress as user,
        CollateralPositionSnapshot.poolAddress as pool,
        SUM(
            collateralAmountUsd * CollateralPoolSnapshot.liquidationFactor
        ) as totalCollateralValue
    FROM `CollateralPositionSnapshot`
        LEFT JOIN `CollateralPoolSnapshot` ON CollateralPositionSnapshot.underlyingTokenAddress = CollateralPoolSnapshot.underlyingTokenAddress
        AND CollateralPositionSnapshot.poolAddress = CollateralPoolSnapshot.poolAddress
    GROUP BY CollateralPositionSnapshot.userAddress,
        CollateralPositionSnapshot.poolAddress
),
user_selected_collateral_position as (
    SELECT 
        tokens.token as tokenSymbol,
        CollateralPositionSnapshot.userAddress as user,
        CollateralPositionSnapshot.poolAddress as pool,
        SUM(CollateralPositionSnapshot.collateralAmountNormalized) as selectedCollateralAmountNormalized,
        SUM(CollateralPositionSnapshot.collateralAmountUsd) as selectedCollateralAmountUsd,
        SUM(
            CollateralPositionSnapshot.collateralAmountNormalized * CollateralPoolSnapshot.liquidationFactor
        ) as selectedCollateralAmount,
        SUM(
            CollateralPositionSnapshot.collateralAmountUsd * CollateralPoolSnapshot.liquidationFactor
        ) as selectedCollateralValue
    FROM tokens
    CROSS JOIN `CollateralPositionSnapshot`
        LEFT JOIN `CollateralPoolSnapshot` ON CollateralPositionSnapshot.underlyingTokenAddress = CollateralPoolSnapshot.underlyingTokenAddress
        AND CollateralPositionSnapshot.poolAddress = CollateralPoolSnapshot.poolAddress
    WHERE CollateralPositionSnapshot.underlyingTokenSymbol = tokens.token
    GROUP BY tokens.token, CollateralPositionSnapshot.userAddress, CollateralPositionSnapshot.poolAddress
),
calculations as(
    SELECT 
        usp.tokenSymbol,
        up.borrowedAmountUsd,
        ucp.totalCollateralValue,
        usp.selectedCollateralAmountNormalized,
        usp.selectedCollateralAmountUsd,
        usp.selectedCollateralAmount,
        COALESCE(usp.selectedCollateralValue, 0) as selectedCollateralValue,
        (ucp.totalCollateralValue - COALESCE(usp.selectedCollateralValue, 0)) as otherCollateralValue,
        (up.borrowedAmountUsd - (ucp.totalCollateralValue - COALESCE(usp.selectedCollateralValue, 0))) as diffDebt,
        ROUND(
            toFloat64(up.borrowedAmountUsd - (ucp.totalCollateralValue - COALESCE(usp.selectedCollateralValue, 0))) / 
            toFloat64(usp.selectedCollateralAmount)
        ) as liqPrice
    FROM user_position up
        LEFT JOIN user_collateral_positions ucp ON up.user = ucp.user AND up.pool = ucp.pool
        LEFT JOIN user_selected_collateral_position usp ON up.user = usp.user AND up.pool = usp.pool
    WHERE COALESCE(usp.selectedCollateralValue, 0) > 0
        AND (up.borrowedAmountUsd - (ucp.totalCollateralValue - COALESCE(usp.selectedCollateralValue, 0))) > 0
    ORDER BY liqPrice DESC)

SELECT 
    tokenSymbol,
    liqPrice, 
    count(*) as count
FROM calculations
GROUP BY tokenSymbol, liqPrice
ORDER BY tokenSymbol, liqPrice DESC;