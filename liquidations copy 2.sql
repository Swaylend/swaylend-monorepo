with user_position as (
    SELECT userAddress,
        poolAddress,
        borrowedAmountUsd
    FROM `BasePositionSnapshot`
    WHERE borrowedAmountUsd > 0
),
user_collateral_positions as (
    SELECT userAddress,
        poolAddress,
        SUM(
            collateralAmountUsd * CollateralPoolSnapshot.liquidationFactor
        ) as totalCollateralValue
    FROM `CollateralPositionSnapshot`
        LEFT JOIN `CollateralPoolSnapshot` ON CollateralPositionSnapshot.underlyingTokenAddress = CollateralPoolSnapshot.underlyingTokenAddress
        AND CollateralPositionSnapshot.poolAddress = CollateralPoolSnapshot.poolAddress
    GROUP BY userAddress,
        poolAddress
),
user_selected_collateral_position as (
    SELECT userAddress,
        poolAddress,
        SUM(collateralAmountNormalized) as selectedCollateralAmountNormalized,
        SUM(collateralAmountUsd) as selectedCollateralAmountUsd,
        SUM(
            collateralAmountNormalized * CollateralPoolSnapshot.liquidationFactor
        ) as selectedCollateralAmount,
        SUM(
            collateralAmountUsd * CollateralPoolSnapshot.liquidationFactor
        ) as selectedCollateralValue
    FROM `CollateralPositionSnapshot`
        LEFT JOIN `CollateralPoolSnapshot` ON CollateralPositionSnapshot.underlyingTokenAddress = CollateralPoolSnapshot.underlyingTokenAddress
        AND CollateralPositionSnapshot.poolAddress = CollateralPoolSnapshot.poolAddress
    WHERE underlyingTokenSymbol = 'ETH'
    GROUP BY userAddress,
        poolAddress
),
calculations as(
    SELECT 
        borrowedAmountUsd,
        totalCollateralValue,
        selectedCollateralAmountNormalized,
        selectedCollateralAmountUsd,
        -- ALREADY MULTIPLIED BY LIQUIDATION FACTOR
        selectedCollateralAmount,
        -- ALREADY MULTIPLIED BY LIQUIDATION FACTOR
        COALESCE(selectedCollateralValue, 0) as selectedCollateralValue,
        (totalCollateralValue - selectedCollateralValue) as otherCollateralValue,
        (borrowedAmountUsd - otherCollateralValue) as diffDebt,
        ROUND(
            toFloat64(diffDebt) / toFloat64(selectedCollateralAmount) / 10
        ) * 10 as liqPrice
    FROM user_position
        LEFT JOIN user_collateral_positions ON user_position.userAddress = user_collateral_positions.userAddress
        AND user_position.poolAddress = user_collateral_positions.poolAddress
        LEFT JOIN user_selected_collateral_position ON user_position.userAddress = user_selected_collateral_position.userAddress
        AND user_position.poolAddress = user_selected_collateral_position.poolAddress
    WHERE selectedCollateralValue > 0
        AND diffDebt > 0
)

SELECT 
    liqPrice,
    count(*) as count,
    ROUND(SUM(SUM(borrowedAmountUsd)) OVER (ORDER BY liqPrice DESC)) as cumulative_liquidated_amount,
    SUM(count(*)) OVER (ORDER BY liqPrice DESC) as cumulative_count
FROM calculations
GROUP BY liqPrice
ORDER BY liqPrice DESC