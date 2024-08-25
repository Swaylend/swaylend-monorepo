import { Market } from 'generated';

const MARKET_ID = 'MARKET_ID';
const PUASE_CONFIGURATION_ID = 'PUASE_CONFIGURATION_ID';
const MARKET_CONFIGURATION_ID = 'MARKET_CONFIGURATION_ID';

// Add Collateral Asset
Market.CollateralAssetAdded.loader(({ event, context }) => {
  const assetId = event.data.asset_id;
  context.CollateralAsset.load(assetId);
});

Market.CollateralAssetAdded.handler(async ({ event, context }) => {
  const assetId = event.data.asset_id;

  context.CollateralAsset.set({
    id: assetId,
    priceFeedId: event.data.configuration.price_feed_id,
    decimals: event.data.configuration.decimals,
    borrowCollateralFactor: event.data.configuration.borrow_collateral_factor,
    liquidateCollateralFactor:
      event.data.configuration.liquidate_collateral_factor,
    liquidationPenalty: event.data.configuration.liquidation_penalty,
    supplyCap: event.data.configuration.supply_cap,
    paused: event.data.configuration.paused,
  });
});

// Update collateral asset
Market.CollateralAssetUpdated.loader(({ event, context }) => {
  const assetId = event.data.asset_id;
  context.CollateralAsset.load(assetId);
});

Market.CollateralAssetUpdated.handler(async ({ event, context }) => {
  const assetId = event.data.asset_id;

  context.CollateralAsset.set({
    id: assetId,
    priceFeedId: event.data.configuration.price_feed_id,
    decimals: event.data.configuration.decimals,
    borrowCollateralFactor: event.data.configuration.borrow_collateral_factor,
    liquidateCollateralFactor:
      event.data.configuration.liquidate_collateral_factor,
    liquidationPenalty: event.data.configuration.liquidation_penalty,
    supplyCap: event.data.configuration.supply_cap,
    paused: event.data.configuration.paused,
  });
});

// Pause Collateral Asset
Market.CollateralAssetPaused.loader(({ event, context }) => {
  const assetId = event.data.asset_id;
  context.CollateralAsset.load(assetId);
});

Market.CollateralAssetPaused.handler(async ({ event, context }) => {
  const assetId = event.data.asset_id;
  const collateralAsset = await context.CollateralAsset.get(assetId);

  if (collateralAsset) {
    context.CollateralAsset.set({
      ...collateralAsset,
      paused: true,
    });
  }
});

// Resume Collateral Asset
Market.CollateralAssetResumed.loader(({ event, context }) => {
  const assetId = event.data.asset_id;
  context.CollateralAsset.load(assetId);
});

Market.CollateralAssetResumed.handler(async ({ event, context }) => {
  const assetId = event.data.asset_id;
  const collateralAsset = await context.CollateralAsset.get(assetId);

  if (collateralAsset) {
    context.CollateralAsset.set({
      ...collateralAsset,
      paused: false,
    });
  }
});

// User Basic Event
Market.UserBasicEvent.loader(({ event, context }) => {
  const address = event.data.address;
  context.User.load(address.bits);
});

Market.UserBasicEvent.handler(async ({ event, context }) => {
  const address = event.data.address;

  const user = await context.User.get(address.bits);

  if (!user) {
    const principalValue = event.data.user_basic.principal.negative
      ? -event.data.user_basic.principal.value
      : event.data.user_basic.principal.value;

    context.User.set({
      id: address.bits,
      address: address.bits,
      principal: principalValue,
      baseTrackingIndex: event.data.user_basic.base_tracking_index,
      baseTrackingAccrued: event.data.user_basic.base_tracking_accrued,
      totalCollateralBought: BigInt(0),
      totalValueLiquidated: BigInt(0),
    });

    return;
  }

  context.User.set({
    ...user,
    principal: event.data.user_basic.principal.negative
      ? -event.data.user_basic.principal.value
      : event.data.user_basic.principal.value,
    baseTrackingIndex: event.data.user_basic.base_tracking_index,
    baseTrackingAccrued: event.data.user_basic.base_tracking_accrued,
  });
});

// Market Basic Event
Market.MarketBasicEvent.loader(({ context }) => {
  context.MarketState.load(MARKET_ID);
});

Market.MarketBasicEvent.handler(async ({ event, context }) => {
  context.MarketState.set({
    id: MARKET_ID,
    baseBorrowIndex: event.data.market_basic.base_borrow_index,
    baseSupplyIndex: event.data.market_basic.base_supply_index,
    lastAccrualTime: event.data.market_basic.last_accrual_time,
    totalBorrowBase: event.data.market_basic.total_borrow_base,
    totalSupplyBase: event.data.market_basic.total_supply_base,
    trackingBorrowIndex: event.data.market_basic.tracking_borrow_index,
    trackingSupplyIndex: event.data.market_basic.tracking_supply_index,
  });
});

// User Collateral Events
Market.UserSupplyCollateralEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.UserCollateralEvent.load(id, {
    loadUser: false,
    loadCollateralAsset: false,
  });

  const userCollateralId = `${event.data.address.bits}-${event.data.asset_id}`;
  context.UserCollateral.load(userCollateralId, {
    loadCollateralAsset: false,
    loadUser: false,
  });

  const address = event.data.address;
  context.User.load(address.bits);
});

Market.UserSupplyCollateralEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  // Create user if it doesn't exist
  const user = await context.User.get(event.data.address.bits);

  if (!user) {
    context.User.set({
      id: event.data.address.bits,
      address: event.data.address.bits,
      principal: BigInt(0),
      baseTrackingIndex: BigInt(0),
      baseTrackingAccrued: BigInt(0),
      totalCollateralBought: BigInt(0),
      totalValueLiquidated: BigInt(0),
    });
  }

  context.UserCollateralEvent.set({
    id,
    user_id: event.data.address.bits,
    collateralAsset_id: event.data.asset_id,
    amount: event.data.amount,
    actionType: 'Supply',
    timestamp: event.time,
  });

  // Also update the many-to-many relationship
  const userCollateralId = `${event.data.address.bits}-${event.data.asset_id}`;

  const userCollateral = await context.UserCollateral.get(userCollateralId);

  // Create user collateral if it doesn't exist
  if (!userCollateral) {
    context.UserCollateral.set({
      id: userCollateralId,
      user_id: event.data.address.bits,
      collateralAsset_id: event.data.asset_id,
      amount: event.data.amount,
    });
  } else {
    // Update user collateral
    context.UserCollateral.set({
      ...userCollateral,
      amount: userCollateral.amount + event.data.amount,
    });
  }
});

Market.UserWithdrawCollateralEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.UserCollateralEvent.load(id, {
    loadUser: false,
    loadCollateralAsset: false,
  });
  const userCollateralId = `${event.data.address.bits}-${event.data.asset_id}`;
  context.UserCollateral.load(userCollateralId, {
    loadCollateralAsset: false,
    loadUser: false,
  });
});

Market.UserWithdrawCollateralEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  context.UserCollateralEvent.set({
    id,
    user_id: event.data.address.bits,
    collateralAsset_id: event.data.asset_id,
    amount: event.data.amount,
    actionType: 'Withdraw',
    timestamp: event.time,
  });

  // Also update the many-to-many relationship
  const userCollateralId = `${event.data.address.bits}-${event.data.asset_id}`;

  const userCollateral = await context.UserCollateral.get(userCollateralId);

  // Create user collateral if it doesn't exist
  if (!userCollateral) {
    context.UserCollateral.set({
      id: userCollateralId,
      user_id: event.data.address.bits,
      collateralAsset_id: event.data.asset_id,
      amount: event.data.amount,
    });
  } else {
    // Update user collateral
    context.UserCollateral.set({
      ...userCollateral,
      amount: userCollateral.amount - event.data.amount,
    });
  }
});

// User Base Asset Events
Market.UserSupplyBaseEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.UserBaseEvent.load(id, { loadUser: false });
});

Market.UserSupplyBaseEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  if (event.data.repay_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_1`,
      user_id: event.data.address.bits,
      amount: event.data.repay_amount,
      actionType: 'Repay',
      timestamp: event.time,
    });
  }

  if (event.data.supply_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_2`,
      user_id: event.data.address.bits,
      amount: event.data.supply_amount,
      actionType: 'Supply',
      timestamp: event.time,
    });
  }
});

Market.UserWithdrawBaseEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.UserBaseEvent.load(id, { loadUser: false });
});

Market.UserWithdrawBaseEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  if (event.data.withdraw_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_1`,
      user_id: event.data.address.bits,
      amount: event.data.withdraw_amount,
      actionType: 'Withdraw',
      timestamp: event.time,
    });
  }

  if (event.data.borrow_amount > 0) {
    context.UserBaseEvent.set({
      id: `${id}_2`,
      user_id: event.data.address.bits,
      amount: event.data.borrow_amount,
      actionType: 'Borrow',
      timestamp: event.time,
    });
  }
});

// Liquidation Events
Market.UserLiquidatedEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.LiquidationEvent.load(id, {
    loadLiquidated: false,
    loadLiquidator: true,
  });
});

Market.UserLiquidatedEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  const liquidator = await context.User.get(event.data.liquidator.bits);

  // Create liquidator if it doesn't exist
  if (!liquidator) {
    context.User.set({
      id: event.data.liquidator.bits,
      address: event.data.liquidator.bits,
      principal: BigInt(0),
      baseTrackingIndex: BigInt(0),
      baseTrackingAccrued: BigInt(0),
      totalCollateralBought: BigInt(0),
      totalValueLiquidated: BigInt(event.data.total_base_value),
    });
  } else {
    // Update liquidator
    context.User.set({
      ...liquidator,
      totalValueLiquidated:
        liquidator.totalValueLiquidated + event.data.total_base_value,
    });
  }

  context.LiquidationEvent.set({
    id,
    liquidator_id: event.data.liquidator.bits,
    liquidated_id: event.data.address.bits,
    basePaidOut: event.data.base_paid_out,
    basePaidOutValue: event.data.base_paid_out_value,
    totalBase: event.data.total_base,
    totalBaseValue: event.data.total_base_value,
    decimals: event.data.decimals,
    timestamp: event.time,
  });
});

Market.AbsorbCollateralEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.AbsorbCollateralEvent.load(id, {
    loadCollateralAsset: false,
    loadUser: true,
  });
});

Market.AbsorbCollateralEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  context.AbsorbCollateralEvent.set({
    id,
    user_id: event.data.address.bits,
    collateralAsset_id: event.data.asset_id,
    amount: event.data.amount,
    seizeValue: event.data.seize_value,
    decimals: event.data.decimals,
    timestamp: event.time,
  });

  // Also update the many-to-many relationship
  const userCollateralId = `${event.data.address.bits}-${event.data.asset_id}`;
  context.UserCollateral.set({
    id: userCollateralId,
    user_id: event.data.address.bits,
    collateralAsset_id: event.data.asset_id,
    amount: BigInt(0),
  });
});

// Buy Collateral Event
Market.BuyCollateralEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.BuyCollateralEvent.load(id, {
    loadCollateralAsset: false,
    loadUser: true,
  });
});

Market.BuyCollateralEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  let user = await context.User.get(event.data.caller.bits);

  // Create user if it doesn't exist
  if (!user) {
    user = {
      id: event.data.caller.bits,
      address: event.data.caller.bits,
      principal: BigInt(0),
      baseTrackingIndex: BigInt(0),
      baseTrackingAccrued: BigInt(0),
      totalCollateralBought: event.data.price,
      totalValueLiquidated: BigInt(0),
    };

    context.User.set(user);
  } else {
    // Update user
    context.User.set({
      ...user,
      totalCollateralBought: user.totalCollateralBought + event.data.price,
    });
  }

  context.BuyCollateralEvent.set({
    id,
    user_id: event.data.caller.bits,
    recipient: event.data.recipient.bits,
    collateralAsset_id: event.data.asset_id,
    amount: event.data.amount,
    price: event.data.price,
    timestamp: event.time,
  });
});

// Reserves Withdrawn Event
Market.ReservesWithdrawnEvent.loader(({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;
  context.ReservesWithdrawnEvent.load(id);
});

Market.ReservesWithdrawnEvent.handler(async ({ event, context }) => {
  const id = `${event.transactionId}_${event.receiptIndex}`;

  context.ReservesWithdrawnEvent.set({
    id,
    recipient: event.data.address.bits,
    amount: event.data.amount,
    timestamp: event.time,
  });
});

// Pause Configuration Event
Market.PauseConfigurationEvent.loader(({ context }) => {
  context.PauseConfiguration.load(PUASE_CONFIGURATION_ID);
});

Market.PauseConfigurationEvent.handler(async ({ event, context }) => {
  const pauseConfiguration = event.data.pause_config;

  context.PauseConfiguration.set({
    id: PUASE_CONFIGURATION_ID,
    supplyPaused: pauseConfiguration.supply_paused,
    withdrawPaused: pauseConfiguration.withdraw_paused,
    absorbPaused: pauseConfiguration.absorb_paused,
    buyPaused: pauseConfiguration.buy_paused,
  });
});

// Market Configuration Event
Market.MarketConfigurationEvent.loader(({ context }) => {
  context.MarketConfiguartion.load(MARKET_CONFIGURATION_ID);
});

Market.MarketConfigurationEvent.handler(async ({ event, context }) => {
  const marketConfiguration = event.data.market_config;

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
