import { indexer } from "envio";
const MARKET_ID = 'MARKET_ID';
const PUASE_CONFIGURATION_ID = 'PUASE_CONFIGURATION_ID';
const MARKET_CONFIGURATION_ID = 'MARKET_CONFIGURATION_ID';

const I256_INDENT = 2n ** 255n;

// Add Collateral Asset
indexer.onEvent(
  { contract: "Market", event: "CollateralAssetAdded" },
  async ({ event, context }) => {
  const assetId = event.params.asset_id.bits;

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
}
);

// Update collateral asset
indexer.onEvent(
  { contract: "Market", event: "CollateralAssetUpdated" },
  async ({ event, context }) => {
  const assetId = event.params.asset_id.bits;

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
}
);

// Pause Collateral Asset
indexer.onEvent(
  { contract: "Market", event: "CollateralAssetPaused" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
    const assetId = event.params.asset_id.bits;
    return { collateralAsset: await context.CollateralAsset.get(assetId) };
  })({ event, context });

        const { collateralAsset } = loaderReturn;

        if (collateralAsset) {
          context.CollateralAsset.set({
            ...collateralAsset,
            paused: true,
          });
        }
  }
);

// Resume Collateral Asset
indexer.onEvent(
  { contract: "Market", event: "CollateralAssetResumed" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
    const assetId = event.params.asset_id.bits;
    return { collateralAsset: await context.CollateralAsset.get(assetId) };
  })({ event, context });

        const { collateralAsset } = loaderReturn;

        if (collateralAsset) {
          context.CollateralAsset.set({
            ...collateralAsset,
            paused: false,
          });
        }
  }
);

// User Basic Event
indexer.onEvent(
  { contract: "Market", event: "UserBasicEvent" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
    // TODO: Verify if this needs to be handled differently
    // case -> address or contractId
    const address = event.params.account.payload.bits;
    return { user: await context.User.get(address) };
  })({ event, context });

        const { user } = loaderReturn;

        if (!user) {
          const principalValue =
            event.params.user_basic.principal.underlying - I256_INDENT;

          const address = event.params.account.payload.bits;

          context.User.set({
            id: address,
            address: address,
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
  }
);

// Market Basic Event
indexer.onEvent(
  { contract: "Market", event: "MarketBasicEvent" },
  async ({ event, context }) => {
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
}
);

// User Collateral Events
indexer.onEvent(
  { contract: "Market", event: "UserSupplyCollateralEvent" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
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
  })({ event, context });

        const { userCollateral, user } = loaderReturn;
        const id = `${event.transaction.id}_${event.logIndex}`;
        const address = event.params.account.payload.bits;

        // Create user if it doesn't exist
        if (!user) {
          context.User.set({
            id: address,
            address: address,
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
        if (!userCollateral) {
          context.UserCollateral.set({
            id: userCollateralId,
            user_id: address,
            collateralAsset_id: event.params.asset_id.bits,
            amount: event.params.amount,
          });
        } else {
          // Update user collateral
          context.UserCollateral.set({
            ...userCollateral,
            amount: userCollateral.amount + event.params.amount,
          });
        }
  }
);

indexer.onEvent(
  { contract: "Market", event: "UserWithdrawCollateralEvent" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
    const address = event.params.account.payload.bits;
    const userCollateralId = `${address}-${event.params.asset_id.bits}`;

    return {
      userCollateral: await context.UserCollateral.get(userCollateralId),
    };
  })({ event, context });

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
        if (!userCollateral) {
          context.UserCollateral.set({
            id: userCollateralId,
            user_id: address,
            collateralAsset_id: event.params.asset_id.bits,
            amount: event.params.amount,
          });
        } else {
          // Update user collateral
          context.UserCollateral.set({
            ...userCollateral,
            amount: userCollateral.amount - event.params.amount,
          });
        }
  }
);

// User Base Asset Events
indexer.onEvent(
  { contract: "Market", event: "UserSupplyBaseEvent" },
  async ({ event, context }) => {
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
}
);

indexer.onEvent(
  { contract: "Market", event: "UserWithdrawBaseEvent" },
  async ({ event, context }) => {
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
}
);

// Liquidation Events
indexer.onEvent(
  { contract: "Market", event: "UserLiquidatedEvent" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
    const address = event.params.liquidator.payload.bits;
    const liquidatorId = `${address}`;
    return { liquidator: await context.User.get(liquidatorId) };
  })({ event, context });

        const id = `${event.transaction.id}_${event.logIndex}`;
        const address = event.params.liquidator.payload.bits;

        const { liquidator } = loaderReturn;

        // Create liquidator if it doesn't exist
        if (!liquidator) {
          context.User.set({
            id: address,
            address: address,
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
          liquidator_id: address,
          liquidated_id: event.params.account.payload.bits,
          basePaidOut: event.params.base_paid_out,
          basePaidOutValue: event.params.base_paid_out_value,
          totalBase: event.params.total_base,
          totalBaseValue: event.params.total_base_value,
          decimals: event.params.decimals,
          timestamp: event.block.time,
        });
  }
);

indexer.onEvent(
  { contract: "Market", event: "AbsorbCollateralEvent" },
  async ({ event, context }) => {
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
}
);

// Buy Collateral Event
indexer.onEvent(
  { contract: "Market", event: "BuyCollateralEvent" },
  async ({ event, context }) => {
    const loaderReturn = await (async ({ event, context }) => {
    const address = event.params.caller.payload.bits;
    return { user: await context.User.get(address) };
  })({ event, context });

        const id = `${event.transaction.id}_${event.logIndex}`;

        const { user } = loaderReturn;
        const address = event.params.caller.payload.bits;

        // Create user if it doesn't exist
        if (!user) {
          context.User.set({
            id: address,
            address: address,
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
          user_id: address,
          recipient: event.params.recipient.payload.bits,
          collateralAsset_id: event.params.asset_id.bits,
          amount: event.params.amount,
          price: event.params.price,
          timestamp: event.block.time,
        });
  }
);

// Reserves Withdrawn Event
indexer.onEvent(
  { contract: "Market", event: "ReservesWithdrawnEvent" },
  async ({ event, context }) => {
  const id = `${event.transaction.id}_${event.logIndex}`;

  context.ReservesWithdrawnEvent.set({
    id,
    recipient: event.params.to.payload.bits,
    caller: event.params.caller.payload.bits,
    amount: event.params.amount,
    timestamp: event.block.time,
  });
}
);

// Pause Configuration Event
indexer.onEvent(
  { contract: "Market", event: "PauseConfigurationEvent" },
  async ({ event, context }) => {
  const pauseConfiguration = event.params.pause_config;

  context.PauseConfiguration.set({
    id: PUASE_CONFIGURATION_ID,
    supplyPaused: pauseConfiguration.supply_paused,
    withdrawPaused: pauseConfiguration.withdraw_paused,
    absorbPaused: pauseConfiguration.absorb_paused,
    buyPaused: pauseConfiguration.buy_paused,
  });
}
);

// Market Configuration Event
indexer.onEvent(
  { contract: "Market", event: "MarketConfigurationEvent" },
  async ({ event, context }) => {
  const marketConfiguration = event.params.market_config;

  context.MarketConfiguartion.set({
    id: MARKET_CONFIGURATION_ID,
    baseToken: marketConfiguration.base_token.bits,
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
}
);
