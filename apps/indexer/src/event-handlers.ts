/** biome-ignore-all lint/suspicious/useAwait: <Handlers must be async> */
import { Market } from 'generated';

const I256_INDENT = 2n ** 255n;

// Add Collateral Asset
Market.CollateralAssetAdded.handler(async ({ event, context }) => {
  const assetId = event.params.asset_id.bits;

  context.CollateralAsset.set({
    id: assetId,
    decimals: event.params.configuration.decimals,
    oracleMaxConfidenceWidth:
      event.params.configuration.oracle_max_confidence_width,
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
  const assetId = event.params.asset_id.bits;

  context.CollateralAsset.set({
    id: assetId,
    decimals: event.params.configuration.decimals,
    oracleMaxConfidenceWidth:
      event.params.configuration.oracle_max_confidence_width,
    borrowCollateralFactor: event.params.configuration.borrow_collateral_factor,
    liquidateCollateralFactor:
      event.params.configuration.liquidate_collateral_factor,
    liquidationPenalty: event.params.configuration.liquidation_penalty,
    supplyCap: event.params.configuration.supply_cap,
    paused: event.params.configuration.paused,
  });
});

// Global Oracle Added Event
Market.GlobalOracleAddedEvent.handler(async ({ event, context }) => {
  const oracleId = event.params.oracle_id;

  context.OracleGlobalConfiguration.set({
    id: oracleId.toString(),
    isDisabled: event.params.oracle_configuration.is_disabled,
    oracleType: event.params.oracle_configuration.oracle_type.case,
  });
});

// Global Oracle Updated Event
Market.GlobalOracleUpdatedEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const oracleId = event.params.oracle_id;
    return {
      oracle: await context.OracleGlobalConfiguration.get(oracleId.toString()),
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { oracle } = loaderReturn;

    if (oracle) {
      context.OracleGlobalConfiguration.set({
        id: oracle.id,
        isDisabled: event.params.oracle_configuration.is_disabled,
        oracleType: event.params.oracle_configuration.oracle_type.case,
      });
    }
  },
});

// Asset Oracle Added Event
Market.AssetOracleAddedEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const oracleId = event.params.oracle_configuration.oracle_id;
    return {
      oracle: await context.OracleGlobalConfiguration.get(oracleId.toString()),
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { oracle } = loaderReturn;

    let priceFeedId = '';

    switch (event.params.oracle_configuration.price_feed_id.case) {
      case 'Pyth':
        priceFeedId = event.params.oracle_configuration.price_feed_id.payload;
        break;
      case 'Stork':
        priceFeedId = event.params.oracle_configuration.price_feed_id.payload;
        break;
      default:
        throw new Error('Invalid oracle type');
    }

    if (oracle) {
      context.AssetOracleConfiguration.set({
        id: `${event.params.asset_id.bits}-${oracle.id}`,
        isDisabled: event.params.oracle_configuration.is_disabled,
        priceFeedId,
        oracle_id: oracle.id,
      });
    }
  },
});

// Asset Oracle Updated Event
Market.AssetOracleUpdatedEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const oracleId = event.params.oracle_configuration.oracle_id;
    return {
      oracle: await context.OracleGlobalConfiguration.get(oracleId.toString()),
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { oracle } = loaderReturn;

    let priceFeedId = '';

    switch (event.params.oracle_configuration.price_feed_id.case) {
      case 'Pyth':
        priceFeedId = event.params.oracle_configuration.price_feed_id.payload;
        break;
      case 'Stork':
        priceFeedId = event.params.oracle_configuration.price_feed_id.payload;
        break;
      default:
        throw new Error('Invalid oracle type');
    }

    if (oracle) {
      context.AssetOracleConfiguration.set({
        id: `${event.params.asset_id.bits}-${oracle.id}`,
        isDisabled: event.params.oracle_configuration.is_disabled,
        priceFeedId,
        oracle_id: oracle.id,
      });
    }
  },
});

// User Basic Event
Market.UserBasicEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const address = event.params.account.payload.bits;
    return { user: await context.User.get(address) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { user } = loaderReturn;

    if (!user) {
      const principalValue =
        event.params.user_basic.principal.underlying - I256_INDENT;

      const address = event.params.account.payload.bits;

      context.User.set({
        id: address,
        address,
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
      principal: event.params.user_basic.principal.underlying - I256_INDENT,
      baseTrackingIndex: event.params.user_basic.base_tracking_index,
      baseTrackingAccrued: event.params.user_basic.base_tracking_accrued,
    });
  },
});

// Market Basic Event
Market.MarketBasicEvent.handler(async ({ event, context }) => {
  context.MarketState.set({
    id: 'MARKET_ID',
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
    const address = event.params.account.payload.bits;

    const userCollateralId = `${address}-${event.params.asset_id.bits}`;

    const [userCollateral, user] = await Promise.all([
      context.UserCollateral.get(userCollateralId),
      context.User.get(address),
    ]);

    return {
      userCollateral,
      user,
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { userCollateral, user } = loaderReturn;
    const id = `${event.transaction.id}_${event.logIndex}`;
    const address = event.params.account.payload.bits;

    // Create user if it doesn't exist
    if (!user) {
      context.User.set({
        id: address,
        address,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),
        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      });
    }

    context.UserCollateralEvent.set({
      id,
      user_id: address,
      collateralAsset_id: event.params.asset_id.bits,
      amount: event.params.amount,
      actionType: 'Supply',
      timestamp: event.block.time,
    });

    // Also update the many-to-many relationship
    const userCollateralId = `${address}-${event.params.asset_id.bits}`;

    // Create user collateral if it doesn't exist
    if (userCollateral) {
      // Update user collateral
      context.UserCollateral.set({
        ...userCollateral,
        amount: userCollateral.amount + event.params.amount,
      });
    } else {
      context.UserCollateral.set({
        id: userCollateralId,
        user_id: address,
        collateralAsset_id: event.params.asset_id.bits,
        amount: event.params.amount,
      });
    }
  },
});

Market.UserWithdrawCollateralEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const address = event.params.account.payload.bits;
    const userCollateralId = `${address}-${event.params.asset_id.bits}`;

    return {
      userCollateral: await context.UserCollateral.get(userCollateralId),
    };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { userCollateral } = loaderReturn;

    const id = `${event.transaction.id}_${event.logIndex}`;
    const address = event.params.account.payload.bits;

    context.UserCollateralEvent.set({
      id,
      user_id: address,
      collateralAsset_id: event.params.asset_id.bits,
      amount: event.params.amount,
      actionType: 'Withdraw',
      timestamp: event.block.time,
    });

    // Also update the many-to-many relationship
    const userCollateralId = `${address}-${event.params.asset_id.bits}`;

    // Create user collateral if it doesn't exist
    if (userCollateral) {
      // Update user collateral
      context.UserCollateral.set({
        ...userCollateral,
        amount: userCollateral.amount - event.params.amount,
      });
    } else {
      context.UserCollateral.set({
        id: userCollateralId,
        user_id: address,
        collateralAsset_id: event.params.asset_id.bits,
        amount: event.params.amount,
      });
    }
  },
});

// User Base Asset Events
Market.UserSupplyBaseEvent.handler(async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;
  const address = event.params.account.payload.bits;

  if (event.params.repay_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_1`,
      user_id: address,
      amount: event.params.repay_amount,
      actionType: 'Repay',
      timestamp: event.block.time,
    });
  }

  if (event.params.supply_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_2`,
      user_id: address,
      amount: event.params.supply_amount,
      actionType: 'Supply',
      timestamp: event.block.time,
    });
  }
});

Market.UserWithdrawBaseEvent.handler(async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;
  const address = event.params.account.payload.bits;

  if (event.params.withdraw_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_1`,
      user_id: address,
      amount: event.params.withdraw_amount,
      actionType: 'Withdraw',
      timestamp: event.block.time,
    });
  }

  if (event.params.borrow_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_2`,
      user_id: address,
      amount: event.params.borrow_amount,
      actionType: 'Borrow',
      timestamp: event.block.time,
    });
  }
});

// Liquidation Events
Market.UserLiquidatedEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const address = event.params.liquidator.payload.bits;
    const liquidatorId = `${address}`;
    return { liquidator: await context.User.get(liquidatorId) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const id = `${event.transaction.id}_${event.logIndex}`;
    const address = event.params.liquidator.payload.bits;

    const { liquidator } = loaderReturn;

    // Create liquidator if it doesn't exist
    if (liquidator) {
      // Update liquidator
      context.User.set({
        ...liquidator,
        totalValueLiquidated:
          liquidator.totalValueLiquidated + event.params.total_base_value,
      });
    } else {
      context.User.set({
        id: address,
        address,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),
        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(event.params.total_base_value),
      });
    }

    context.LiquidationEvent.set({
      id,
      liquidator_id: address,
      liquidated_id: event.params.account.payload.bits,
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
  const address = event.params.account.payload.bits;

  context.AbsorbCollateralEvent.set({
    id,
    user_id: address,
    collateralAsset_id: event.params.asset_id.bits,
    amount: event.params.amount,
    seizeValue: event.params.seize_value,
    decimals: event.params.decimals,
    timestamp: event.block.time,
  });

  // Also update the many-to-many relationship
  const userCollateralId = `${address}-${event.params.asset_id.bits}`;
  context.UserCollateral.set({
    id: userCollateralId,
    user_id: address,
    collateralAsset_id: event.params.asset_id.bits,
    amount: BigInt(0),
  });
});

// Buy Collateral Event
Market.BuyCollateralEvent.handlerWithLoader({
  loader: async ({ event, context }) => {
    const address = event.params.caller.payload.bits;
    return { user: await context.User.get(address) };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const id = `${event.transaction.id}_${event.logIndex}`;

    const { user } = loaderReturn;
    const address = event.params.caller.payload.bits;

    // Create user if it doesn't exist
    if (user) {
      // Update user
      context.User.set({
        ...user,
        totalCollateralBought: user.totalCollateralBought + event.params.price,
      });
    } else {
      context.User.set({
        id: address,
        address,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),
        totalCollateralBought: event.params.price,
        totalValueLiquidated: BigInt(0),
      });
    }

    context.BuyCollateralEvent.set({
      id,
      user_id: address,
      recipient: event.params.recipient.payload.bits,
      collateralAsset_id: event.params.asset_id.bits,
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
    recipient: event.params.to.payload.bits,
    caller: event.params.caller.payload.bits,
    amount: event.params.amount,
    timestamp: event.block.time,
  });
});

// Pause Configuration Event
Market.PauseConfigurationEvent.handler(async ({ event, context }) => {
  const pauseConfiguration = event.params.pause_config;

  context.PauseConfiguration.set({
    id: 'PUASE_CONFIGURATION_ID',
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
    id: 'MARKET_CONFIGURATION_ID',
    baseToken: marketConfiguration.base_token.bits,
    baseTokenDecimals: marketConfiguration.base_token_decimals,
    oracleMaxConfidenceWidth: marketConfiguration.oracle_max_confidence_width,
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
