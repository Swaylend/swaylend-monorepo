import { Market } from 'generated';

const MARKET_ID = 'MARKET_ID';
const PUASE_CONFIGURATION_ID = 'PUASE_CONFIGURATION_ID';
const MARKET_CONFIGURATION_ID = 'MARKET_CONFIGURATION_ID';

// Add Collateral Asset
Market.CollateralAssetAdded.handler(async ({ event, context }) => {
  const assetId = event.params.asset_id;

  context.CollateralAsset.set({
    id: assetId,
    priceFeedId: event.params.configuration.price_feed_id,
    decimals: event.params.configuration.decimals,
    borrowCollateralFactor: event.params.configuration.borrow_collateral_factor,
    liquidateCollateralFactor:
      event.params.configuration.liquidate_collateral_factor,
    liquidationPenalty: event.params.configuration.liquidation_penalty,
    supplyCap: event.params.configuration.supply_cap,
    paused: event.params.configuration.paused,
  });
});

// Update collateral asset
Market.CollateralAssetUpdated.handler(async ({ event, context }) => {
  const assetId = event.params.asset_id;

  context.CollateralAsset.set({
    id: assetId,
    priceFeedId: event.params.configuration.price_feed_id,
    decimals: event.params.configuration.decimals,
    borrowCollateralFactor: event.params.configuration.borrow_collateral_factor,
    liquidateCollateralFactor:
      event.params.configuration.liquidate_collateral_factor,
    liquidationPenalty: event.params.configuration.liquidation_penalty,
    supplyCap: event.params.configuration.supply_cap,
    paused: event.params.configuration.paused,
  });
});

// Pause Collateral Asset
Market.CollateralAssetPaused.handlerWithLoader({
  loader: async ({ event, context }) => {
    const assetId = event.params.asset_id;
    return { collateralAsset: await context.CollateralAsset.get(assetId) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { collateralAsset } = loaderReturn;

    if (collateralAsset) {
      context.CollateralAsset.set({
        ...collateralAsset,
        paused: true,
      });
    }
  },
});

// Resume Collateral Asset
Market.CollateralAssetResumed.handlerWithLoader({
  loader: async ({ event, context }) => {
    const assetId = event.params.asset_id;
    return { collateralAsset: await context.CollateralAsset.get(assetId) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { collateralAsset } = loaderReturn;

    if (collateralAsset) {
      context.CollateralAsset.set({
        ...collateralAsset,
        paused: false,
      });
    }
  },
});

// User Basic Event
Market.UserBasicEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const address = event.params.address;
    return { user: await context.User.get(address.bits) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { user } = loaderReturn;

    if (!user) {
      const principalValue = event.params.user_basic.principal.negative
        ? -event.params.user_basic.principal.value
        : event.params.user_basic.principal.value;

      context.User.set({
        id: event.params.address.bits,
        address: event.params.address.bits,
        principal: principalValue,
        baseTrackingIndex: event.params.user_basic.base_tracking_index,
        baseTrackingAccrued: event.params.user_basic.base_tracking_accrued,
        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      });

      return;
    }

    context.User.set({
      ...user,
      principal: event.params.user_basic.principal.negative
        ? -event.params.user_basic.principal.value
        : event.params.user_basic.principal.value,
      baseTrackingIndex: event.params.user_basic.base_tracking_index,
      baseTrackingAccrued: event.params.user_basic.base_tracking_accrued,
    });
  },
});

// Market Basic Event
Market.MarketBasicEvent.handler(async ({ event, context }) => {
  context.MarketState.set({
    id: MARKET_ID,
    baseBorrowIndex: event.params.market_basic.base_borrow_index,
    baseSupplyIndex: event.params.market_basic.base_supply_index,
    lastAccrualTime: event.params.market_basic.last_accrual_time,
    totalBorrowBase: event.params.market_basic.total_borrow_base,
    totalSupplyBase: event.params.market_basic.total_supply_base,
    trackingBorrowIndex: event.params.market_basic.tracking_borrow_index,
    trackingSupplyIndex: event.params.market_basic.tracking_supply_index,
  });
});

// User Collateral Events
Market.UserSupplyCollateralEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const userCollateralId = `${event.params.address.bits}-${event.params.asset_id}`;

    const [userCollateral, user] = await Promise.all([
      context.UserCollateral.get(userCollateralId),
      context.User.get(event.params.address.bits),
    ]);

    return {
      userCollateral,
      user,
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { userCollateral, user } = loaderReturn;
    const id = `${event.transaction.id}_${event.logIndex}`;

    // Create user if it doesn't exist
    if (!user) {
      context.User.set({
        id: event.params.address.bits,
        address: event.params.address.bits,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),
        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      });
    }

    context.UserCollateralEvent.set({
      id,
      user_id: event.params.address.bits,
      collateralAsset_id: event.params.asset_id,
      amount: event.params.amount,
      actionType: 'Supply',
      timestamp: event.block.time,
    });

    // Also update the many-to-many relationship
    const userCollateralId = `${event.params.address.bits}-${event.params.asset_id}`;

    // Create user collateral if it doesn't exist
    if (!userCollateral) {
      context.UserCollateral.set({
        id: userCollateralId,
        user_id: event.params.address.bits,
        collateralAsset_id: event.params.asset_id,
        amount: event.params.amount,
      });
    } else {
      // Update user collateral
      context.UserCollateral.set({
        ...userCollateral,
        amount: userCollateral.amount + event.params.amount,
      });
    }
  },
});

Market.UserWithdrawCollateralEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const userCollateralId = `${event.params.address.bits}-${event.params.asset_id}`;

    return {
      userCollateral: await context.UserCollateral.get(userCollateralId),
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { userCollateral } = loaderReturn;

    const id = `${event.transaction.id}_${event.logIndex}`;

    context.UserCollateralEvent.set({
      id,
      user_id: event.params.address.bits,
      collateralAsset_id: event.params.asset_id,
      amount: event.params.amount,
      actionType: 'Withdraw',
      timestamp: event.block.time,
    });

    // Also update the many-to-many relationship
    const userCollateralId = `${event.params.address.bits}-${event.params.asset_id}`;

    // Create user collateral if it doesn't exist
    if (!userCollateral) {
      context.UserCollateral.set({
        id: userCollateralId,
        user_id: event.params.address.bits,
        collateralAsset_id: event.params.asset_id,
        amount: event.params.amount,
      });
    } else {
      // Update user collateral
      context.UserCollateral.set({
        ...userCollateral,
        amount: userCollateral.amount - event.params.amount,
      });
    }
  },
});

// User Base Asset Events
Market.UserSupplyBaseEvent.handler(async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;

  if (event.params.repay_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_1`,
      user_id: event.params.address.bits,
      amount: event.params.repay_amount,
      actionType: 'Repay',
      timestamp: event.block.time,
    });
  }

  if (event.params.supply_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_2`,
      user_id: event.params.address.bits,
      amount: event.params.supply_amount,
      actionType: 'Supply',
      timestamp: event.block.time,
    });
  }
});

Market.UserWithdrawBaseEvent.handler(async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;

  if (event.params.withdraw_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_1`,
      user_id: event.params.address.bits,
      amount: event.params.withdraw_amount,
      actionType: 'Withdraw',
      timestamp: event.block.time,
    });
  }

  if (event.params.borrow_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_2`,
      user_id: event.params.address.bits,
      amount: event.params.borrow_amount,
      actionType: 'Borrow',
      timestamp: event.block.time,
    });
  }
});

// Liquidation Events
Market.UserLiquidatedEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const liquidatorId = `${event.params.liquidator.bits}`;
    return { liquidator: await context.User.get(liquidatorId) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const id = `${event.transaction.id}_${event.logIndex}`;

    const { liquidator } = loaderReturn;

    // Create liquidator if it doesn't exist
    if (!liquidator) {
      context.User.set({
        id: event.params.liquidator.bits,
        address: event.params.liquidator.bits,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),
        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(event.params.total_base_value),
      });
    } else {
      // Update liquidator
      context.User.set({
        ...liquidator,
        totalValueLiquidated:
          liquidator.totalValueLiquidated + event.params.total_base_value,
      });
    }

    context.LiquidationEvent.set({
      id,
      liquidator_id: event.params.liquidator.bits,
      liquidated_id: event.params.address.bits,
      basePaidOut: event.params.base_paid_out,
      basePaidOutValue: event.params.base_paid_out_value,
      totalBase: event.params.total_base,
      totalBaseValue: event.params.total_base_value,
      decimals: event.params.decimals,
      timestamp: event.block.time,
    });
  },
});

Market.AbsorbCollateralEvent.handler(async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;

  context.AbsorbCollateralEvent.set({
    id,
    user_id: event.params.address.bits,
    collateralAsset_id: event.params.asset_id,
    amount: event.params.amount,
    seizeValue: event.params.seize_value,
    decimals: event.params.decimals,
    timestamp: event.block.time,
  });

  // Also update the many-to-many relationship
  const userCollateralId = `${event.params.address.bits}-${event.params.asset_id}`;
  context.UserCollateral.set({
    id: userCollateralId,
    user_id: event.params.address.bits,
    collateralAsset_id: event.params.asset_id,
    amount: BigInt(0),
  });
});

// Buy Collateral Event
Market.BuyCollateralEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const userId = `${event.params.caller.bits}`;
    return { user: await context.User.get(userId) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const id = `${event.transaction.id}_${event.logIndex}`;

    const { user } = loaderReturn;

    // Create user if it doesn't exist
    if (!user) {
      context.User.set({
        id: event.params.caller.bits,
        address: event.params.caller.bits,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),
        totalCollateralBought: event.params.price,
        totalValueLiquidated: BigInt(0),
      });
    } else {
      // Update user
      context.User.set({
        ...user,
        totalCollateralBought: user.totalCollateralBought + event.params.price,
      });
    }

    context.BuyCollateralEvent.set({
      id,
      user_id: event.params.caller.bits,
      recipient: event.params.recipient.bits,
      collateralAsset_id: event.params.asset_id,
      amount: event.params.amount,
      price: event.params.price,
      timestamp: event.block.time,
    });
  },
});

// Reserves Withdrawn Event
Market.ReservesWithdrawnEvent.handler(async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;

  context.ReservesWithdrawnEvent.set({
    id,
    recipient: event.params.address.bits,
    amount: event.params.amount,
    timestamp: event.block.time,
  });
});

// Pause Configuration Event
Market.PauseConfigurationEvent.handler(async ({ event, context }) => {
  const pauseConfiguration = event.params.pause_config;

  context.PauseConfiguration.set({
    id: PUASE_CONFIGURATION_ID,
    supplyPaused: pauseConfiguration.supply_paused,
    withdrawPaused: pauseConfiguration.withdraw_paused,
    absorbPaused: pauseConfiguration.absorb_paused,
    buyPaused: pauseConfiguration.buy_paused,
  });
});

// Market Configuration Event
Market.MarketConfigurationEvent.handler(async ({ event, context }) => {
  const marketConfiguration = event.params.market_config;

  context.MarketConfiguartion.set({
    id: MARKET_CONFIGURATION_ID,
    governor: marketConfiguration.governor.bits,
    pause_guardian: marketConfiguration.pause_guardian.bits,
    baseToken: marketConfiguration.base_token,
    baseTokenDecimals: marketConfiguration.base_token_decimals,
    baseTokenPriceFeedId: marketConfiguration.base_token_price_feed_id,
    supplyKink: marketConfiguration.supply_kink,
    borrowKink: marketConfiguration.borrow_kink,
    supplyPerSecondInterestRateSlopeLow:
      marketConfiguration.supply_per_second_interest_rate_slope_low,
    supplyPerSecondInterestRateSlopeHigh:
      marketConfiguration.supply_per_second_interest_rate_slope_high,
    supplyPerSecondInterestRateBase:
      marketConfiguration.supply_per_second_interest_rate_base,
    borrowPerSecondInterestRateSlopeLow:
      marketConfiguration.borrow_per_second_interest_rate_slope_low,
    borrowPerSecondInterestRateSlopeHigh:
      marketConfiguration.borrow_per_second_interest_rate_slope_high,
    borrowPerSecondInterestRateBase:
      marketConfiguration.borrow_per_second_interest_rate_base,
    storeFrontPriceFactor: marketConfiguration.store_front_price_factor,
    baseTrackingIndexScale: marketConfiguration.base_tracking_index_scale,
    baseTrackingSupplySpeed: marketConfiguration.base_tracking_supply_speed,
    baseTrackingBorrowSpeed: marketConfiguration.base_tracking_borrow_speed,
    baseMinForRewards: marketConfiguration.base_min_for_rewards,
    baseBorrowMin: marketConfiguration.base_borrow_min,
    targetReserves: marketConfiguration.target_reserves,
  });
});
