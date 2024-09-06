import { BigDecimal } from '@sentio/sdk';
import { FuelNetwork } from '@sentio/sdk/fuel';
import { DateTime } from 'fuels';
import { ASSET_ID_TO_SYMBOL } from './constants.js';
import {
  CollateralConfiguration,
  MarketConfiguration,
  Pool,
  PoolSnapshot,
  PositionSnapshot,
} from './schema/store.js';
import { MarketProcessor } from './types/fuel/MarketProcessor.js';

const FACTOR_SCALE_15 = BigDecimal(10).pow(15);
const FACTOR_SCALE_18 = BigDecimal(10).pow(18);
const SECONDS_PER_YEAR = BigDecimal(365).times(24).times(60).times(60);

const geBorrowRate = (
  marketConfig: MarketConfiguration,
  utilization: BigDecimal
): BigDecimal => {
  if (utilization.lte(marketConfig.borrowKink)) {
    return marketConfig.borrowPerSecondInterestRateBase.plus(
      marketConfig.borrowPerSecondInterestRateSlopeLow
        .times(utilization)
        .dividedBy(FACTOR_SCALE_18)
    );
  }

  return marketConfig.borrowPerSecondInterestRateBase
    .plus(
      marketConfig.borrowPerSecondInterestRateSlopeLow
        .times(marketConfig.borrowKink)
        .dividedBy(FACTOR_SCALE_18)
    )
    .plus(
      marketConfig.borrowPerSecondInterestRateSlopeHigh
        .times(utilization.minus(marketConfig.borrowKink))
        .dividedBy(FACTOR_SCALE_18)
    );
};

const getSupplyRate = (
  marketConfig: MarketConfiguration,
  utilization: BigDecimal
): BigDecimal => {
  if (utilization.lte(marketConfig.supplyKink)) {
    return marketConfig.supplyPerSecondInterestRateBase.plus(
      marketConfig.supplyPerSecondInterestRateSlopeLow
        .times(utilization)
        .dividedBy(FACTOR_SCALE_18)
    );
  }

  return marketConfig.supplyPerSecondInterestRateBase
    .plus(
      marketConfig.supplyPerSecondInterestRateSlopeLow
        .times(marketConfig.supplyKink)
        .dividedBy(FACTOR_SCALE_18)
    )
    .plus(
      marketConfig.supplyPerSecondInterestRateSlopeHigh
        .times(utilization.minus(marketConfig.supplyKink))
        .dividedBy(FACTOR_SCALE_18)
    );
};

MarketProcessor.bind({
  chainId: FuelNetwork.TEST_NET,
  address: '0x8cd0c973a8ab7c15c0a8ee8f5cb4dd04ea3f27411c8eef6e76f3765fe43863fe',
  startBlock: BigInt(9500000),
})
  .onLogMarketConfigurationEvent(async (event, ctx) => {
    const {
      data: {
        market_config: {
          base_token,
          base_token_decimals,
          borrow_kink,
          supply_kink,
          supply_per_second_interest_rate_base,
          supply_per_second_interest_rate_slope_low,
          supply_per_second_interest_rate_slope_high,
          borrow_per_second_interest_rate_base,
          borrow_per_second_interest_rate_slope_low,
          borrow_per_second_interest_rate_slope_high,
        },
      },
    } = event;

    // Chain ID, contract address
    const id = `${ctx.chainId}_${ctx.contractAddress}`;

    let marketConfiguration = await ctx.store.get(MarketConfiguration, id);

    if (!marketConfiguration) {
      marketConfiguration = new MarketConfiguration({
        id,
        chainId: ctx.chainId,
        contractAddress: ctx.contractAddress,
        baseTokenAddress: base_token,
        baseTokenDecimals: base_token_decimals,
        supplyKink: BigDecimal(supply_kink.toString()),
        borrowKink: BigDecimal(borrow_kink.toString()),
        supplyPerSecondInterestRateBase: BigDecimal(
          supply_per_second_interest_rate_base.toString()
        ),
        supplyPerSecondInterestRateSlopeLow: BigDecimal(
          supply_per_second_interest_rate_slope_low.toString()
        ),
        supplyPerSecondInterestRateSlopeHigh: BigDecimal(
          supply_per_second_interest_rate_slope_high.toString()
        ),
        borrowPerSecondInterestRateBase: BigDecimal(
          borrow_per_second_interest_rate_base.toString()
        ),
        borrowPerSecondInterestRateSlopeLow: BigDecimal(
          borrow_per_second_interest_rate_slope_low.toString()
        ),
        borrowPerSecondInterestRateSlopeHigh: BigDecimal(
          borrow_per_second_interest_rate_slope_high.toString()
        ),
      });
    } else {
      marketConfiguration.baseTokenAddress = base_token;
      marketConfiguration.baseTokenDecimals = base_token_decimals;
      marketConfiguration.chainId = ctx.chainId;
      marketConfiguration.contractAddress = ctx.contractAddress;
      marketConfiguration.supplyKink = BigDecimal(supply_kink.toString());
      marketConfiguration.borrowKink = BigDecimal(borrow_kink.toString());
      marketConfiguration.supplyPerSecondInterestRateBase = BigDecimal(
        supply_per_second_interest_rate_base.toString()
      );
      marketConfiguration.supplyPerSecondInterestRateSlopeLow = BigDecimal(
        supply_per_second_interest_rate_slope_low.toString()
      );
      marketConfiguration.supplyPerSecondInterestRateSlopeHigh = BigDecimal(
        supply_per_second_interest_rate_slope_high.toString()
      );
      marketConfiguration.borrowPerSecondInterestRateBase = BigDecimal(
        borrow_per_second_interest_rate_base.toString()
      );
      marketConfiguration.borrowPerSecondInterestRateSlopeLow = BigDecimal(
        borrow_per_second_interest_rate_slope_low.toString()
      );
      marketConfiguration.borrowPerSecondInterestRateSlopeHigh = BigDecimal(
        borrow_per_second_interest_rate_slope_high.toString()
      );
    }

    await ctx.store.upsert(marketConfiguration);

    // Create pool if it doesn't exist
    const poolId = `${ctx.chainId}_${ctx.contractAddress}_${base_token}`;
    const pool = await ctx.store.get(Pool, poolId);

    if (!pool) {
      if (!ctx.transaction) throw new Error('No transaction found');
      if (!ctx.transaction.blockNumber) {
        throw new Error('Transaction block number missing');
      }
      if (!ctx.transaction.time) throw new Error('Transaction time missing');

      const pool = new Pool({
        id: poolId,
        chainId: ctx.chainId,
        creationBlockNumber: Number(ctx.transaction?.blockNumber),
        creationTimestamp: DateTime.fromTai64(
          ctx.transaction.time
        ).toUnixSeconds(),
        underlyingTokenAddress: base_token,
        underlyingTokenSymbol: ASSET_ID_TO_SYMBOL[base_token],
        receiptTokenAddress: 'TODO',
        receiptTokenSymbol: 'TODO',
        poolAddress: ctx.contractAddress,
        poolType: 'supply_only',
      });

      await ctx.store.upsert(pool);
    }

    // Create pool snapshot
    const poolSnapshotId = `${ctx.chainId}_${ctx.contractAddress}_${base_token}`;
    const poolSnapshot = await ctx.store.get(PoolSnapshot, poolSnapshotId);

    if (!poolSnapshot) {
      const poolSnapshot = new PoolSnapshot({
        id: poolSnapshotId,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        underlyingTokenAddress: base_token,
        underlyingTokenSymbol: ASSET_ID_TO_SYMBOL[base_token],
        underlyingTokenPriceUsd: BigDecimal(0),
        availableAmount: BigDecimal(0),
        availableAmountUsd: BigDecimal(0),
        suppliedAmount: BigDecimal(0),
        suppliedAmountUsd: BigDecimal(0),
        nonRecursiveSuppliedAmount: BigDecimal(0),
        collateralAmount: BigDecimal(0),
        collateralAmountUsd: BigDecimal(0),
        collateralFactor: BigDecimal(0),
        supplyIndex: BigDecimal(0),
        supplyApr: BigDecimal(0),
        borrowedAmount: BigDecimal(0),
        borrowedAmountUsd: BigDecimal(0),
        borrowIndex: BigDecimal(0),
        borrowApr: BigDecimal(0),
        totalFeesUsd: BigDecimal(0),
        userFeesUsd: BigDecimal(0),
        protocolFeesUsd: BigDecimal(0),
      });

      await ctx.store.upsert(poolSnapshot);
    }
  })
  .onLogCollateralAssetAdded(async (event, ctx) => {
    const {
      data: {
        asset_id,
        configuration: { decimals, borrow_collateral_factor },
      },
    } = event;

    const id = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;

    let collateralConfiguration = await ctx.store.get(
      CollateralConfiguration,
      id
    );

    if (!collateralConfiguration) {
      collateralConfiguration = new CollateralConfiguration({
        id,
        chainId: ctx.chainId,
        contractAddress: ctx.contractAddress,
        assetAddress: asset_id,
        decimals: decimals,
      });
    } else {
      throw new Error(
        `Collateral configuration already exists for asset ${asset_id} on chain ${ctx.chainId}`
      );
    }

    await ctx.store.upsert(collateralConfiguration);

    // Create pool if it doesn't exist
    const poolId = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;
    const pool = await ctx.store.get(Pool, poolId);

    if (!pool) {
      if (!ctx.transaction) throw new Error('No transaction found');
      if (!ctx.transaction.blockNumber) {
        throw new Error('Transaction block number missing');
      }
      if (!ctx.transaction.time) throw new Error('Transaction time missing');

      const pool = new Pool({
        id: poolId,
        chainId: ctx.chainId,
        creationBlockNumber: Number(ctx.transaction?.blockNumber),
        creationTimestamp: DateTime.fromTai64(
          ctx.transaction.time
        ).toUnixSeconds(),
        underlyingTokenAddress: asset_id,
        underlyingTokenSymbol: ASSET_ID_TO_SYMBOL[asset_id],
        receiptTokenAddress: 'TODO',
        receiptTokenSymbol: 'TODO',
        poolAddress: ctx.contractAddress,
        poolType: 'collateral_only',
      });

      await ctx.store.upsert(pool);
    }

    // Create pool snapshot
    const poolSnapshotId = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;
    const poolSnapshot = await ctx.store.get(PoolSnapshot, poolSnapshotId);

    if (!poolSnapshot) {
      const poolSnapshot = new PoolSnapshot({
        id: poolSnapshotId,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        underlyingTokenAddress: asset_id,
        underlyingTokenSymbol: ASSET_ID_TO_SYMBOL[asset_id],
        underlyingTokenPriceUsd: BigDecimal(0),
        availableAmount: BigDecimal(0),
        availableAmountUsd: BigDecimal(0),
        suppliedAmount: BigDecimal(0),
        suppliedAmountUsd: BigDecimal(0),
        nonRecursiveSuppliedAmount: BigDecimal(0),
        collateralAmount: BigDecimal(0),
        collateralAmountUsd: BigDecimal(0),
        collateralFactor: BigDecimal(
          borrow_collateral_factor.toString()
        ).dividedBy(FACTOR_SCALE_18),
        supplyIndex: BigDecimal(0),
        supplyApr: BigDecimal(0),
        borrowedAmount: BigDecimal(0),
        borrowedAmountUsd: BigDecimal(0),
        borrowIndex: BigDecimal(0),
        borrowApr: BigDecimal(0),
        totalFeesUsd: BigDecimal(0),
        userFeesUsd: BigDecimal(0),
        protocolFeesUsd: BigDecimal(0),
      });

      await ctx.store.upsert(poolSnapshot);
    }
  })
  .onLogCollateralAssetUpdated(async (event, ctx) => {
    const {
      data: {
        asset_id,
        configuration: { decimals },
      },
    } = event;

    const id = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;

    let collateralConfiguration = await ctx.store.get(
      CollateralConfiguration,
      id
    );

    if (!collateralConfiguration) {
      throw new Error(
        `Collateral configuration not found for asset ${asset_id} on chain ${ctx.chainId}`
      );
    }

    collateralConfiguration = new CollateralConfiguration({
      id,
      chainId: ctx.chainId,
      contractAddress: ctx.contractAddress,
      assetAddress: asset_id,
      decimals: decimals,
    });

    await ctx.store.upsert(collateralConfiguration);
  })
  .onLogUserSupplyBaseEvent(async (event, ctx) => {
    const {
      data: { address, repay_amount, supply_amount },
    } = event;

    const marketConfigId = `${ctx.chainId}_${ctx.contractAddress}`;
    const marketConfiguration = await ctx.store.get(
      MarketConfiguration,
      marketConfigId
    );

    if (!marketConfiguration) {
      throw new Error(
        `Market configuration not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    // Chain ID, contract address, user address, token address
    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}_${marketConfiguration.baseTokenAddress}`;

    let positionSnapshot = await ctx.store.get(PositionSnapshot, id);

    if (!positionSnapshot) {
      positionSnapshot = new PositionSnapshot({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        underlyingTokenAddress: marketConfiguration.baseTokenAddress,
        underlyingTokenSymbol:
          ASSET_ID_TO_SYMBOL[marketConfiguration.baseTokenAddress],
        userAddress: address.bits,
        suppliedAmount: BigDecimal(supply_amount.toString()).dividedBy(
          BigDecimal(10).pow(marketConfiguration.baseTokenDecimals)
        ),
        borrowedAmount: BigDecimal(0),
        collateralAmount: BigDecimal(0),
      });
    } else {
      if (supply_amount.gt(0)) {
        positionSnapshot.suppliedAmount = positionSnapshot.suppliedAmount.plus(
          BigDecimal(supply_amount.toString()).dividedBy(
            BigDecimal(10).pow(marketConfiguration.baseTokenDecimals)
          )
        );
      }

      if (repay_amount.gt(0)) {
        positionSnapshot.borrowedAmount = positionSnapshot.borrowedAmount.minus(
          BigDecimal(repay_amount.toString()).dividedBy(
            BigDecimal(10).pow(marketConfiguration.baseTokenDecimals)
          )
        );

        if (positionSnapshot.borrowedAmount.lt(0)) {
          positionSnapshot.borrowedAmount = BigDecimal(0);
        }
      }
    }

    await ctx.store.upsert(positionSnapshot);
  })
  .onLogUserWithdrawBaseEvent(async (event, ctx) => {
    const {
      data: { address, borrow_amount, withdraw_amount },
    } = event;

    const marketConfigId = `${ctx.chainId}_${ctx.contractAddress}`;
    const marketConfiguration = await ctx.store.get(
      MarketConfiguration,
      marketConfigId
    );

    if (!marketConfiguration) {
      throw new Error(
        `Market configuration not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}_${marketConfiguration.baseTokenAddress}`;

    let positionSnapshot = await ctx.store.get(PositionSnapshot, id);

    if (!positionSnapshot) {
      positionSnapshot = new PositionSnapshot({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        underlyingTokenAddress: marketConfiguration.baseTokenAddress,
        underlyingTokenSymbol:
          ASSET_ID_TO_SYMBOL[marketConfiguration.baseTokenAddress],
        userAddress: address.bits,
        suppliedAmount: BigDecimal(0),
        borrowedAmount: BigDecimal(borrow_amount.toString()).dividedBy(
          BigDecimal(10).pow(marketConfiguration.baseTokenDecimals)
        ),
        collateralAmount: BigDecimal(0),
      });
    } else {
      if (borrow_amount.gt(0)) {
        positionSnapshot.borrowedAmount = positionSnapshot.borrowedAmount.plus(
          BigDecimal(borrow_amount.toString()).dividedBy(
            BigDecimal(10).pow(marketConfiguration.baseTokenDecimals)
          )
        );
      }

      if (withdraw_amount.gt(0)) {
        positionSnapshot.suppliedAmount = positionSnapshot.suppliedAmount.minus(
          BigDecimal(withdraw_amount.toString()).dividedBy(
            BigDecimal(10).pow(marketConfiguration.baseTokenDecimals)
          )
        );

        if (positionSnapshot.suppliedAmount.lt(0)) {
          positionSnapshot.suppliedAmount = BigDecimal(0);
        }
      }
    }

    await ctx.store.upsert(positionSnapshot);
  })
  .onLogUserSupplyCollateralEvent(async (event, ctx) => {
    const {
      data: { address, asset_id, amount },
    } = event;

    const collateralConfigurationId = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;
    const collateralConfiguration = await ctx.store.get(
      CollateralConfiguration,
      collateralConfigurationId
    );

    if (!collateralConfiguration) {
      throw new Error(
        `Collateral configuration not found for asset ${asset_id} on chain ${ctx.chainId}`
      );
    }

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}_${asset_id}`;

    let positionSnapshot = await ctx.store.get(PositionSnapshot, id);

    if (!positionSnapshot) {
      positionSnapshot = new PositionSnapshot({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        underlyingTokenAddress: collateralConfiguration.assetAddress,
        underlyingTokenSymbol:
          ASSET_ID_TO_SYMBOL[collateralConfiguration.assetAddress],
        userAddress: address.bits,
        suppliedAmount: BigDecimal(0),
        borrowedAmount: BigDecimal(0),
        collateralAmount: BigDecimal(amount.toString()).dividedBy(
          BigDecimal(10).pow(collateralConfiguration.decimals)
        ),
      });
    } else {
      positionSnapshot.collateralAmount =
        positionSnapshot.collateralAmount.plus(
          BigDecimal(amount.toString()).dividedBy(
            BigDecimal(10).pow(collateralConfiguration.decimals)
          )
        );
    }

    await ctx.store.upsert(positionSnapshot);

    // Pool snapshot
    const poolSnapshotId = `${ctx.chainId}_${ctx.contractAddress}_${collateralConfiguration.assetAddress}`;
    const poolSnapshot = await ctx.store.get(PoolSnapshot, poolSnapshotId);

    if (!poolSnapshot) {
      throw new Error(
        `Pool snapshot not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    poolSnapshot.collateralAmount = BigDecimal(
      poolSnapshot.collateralAmount
    ).plus(
      BigDecimal(amount.toString()).dividedBy(
        BigDecimal(10).pow(collateralConfiguration.decimals)
      )
    );

    await ctx.store.upsert(poolSnapshot);
  })
  .onLogUserWithdrawCollateralEvent(async (event, ctx) => {
    const {
      data: { address, asset_id, amount },
    } = event;

    const collateralConfigurationId = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;
    const collateralConfiguration = await ctx.store.get(
      CollateralConfiguration,
      collateralConfigurationId
    );

    if (!collateralConfiguration) {
      throw new Error(
        `Collateral configuration not found for asset ${asset_id} on chain ${ctx.chainId}`
      );
    }

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}_${asset_id}`;

    const positionSnapshot = await ctx.store.get(PositionSnapshot, id);

    if (!positionSnapshot) {
      throw new Error(
        `Position snapshot (${id}) not found for user ${address.bits} on chain ${ctx.chainId}`
      );
    }

    positionSnapshot.collateralAmount = BigDecimal(
      positionSnapshot.collateralAmount
        .minus(
          BigDecimal(amount.toString()).dividedBy(
            BigDecimal(10).pow(collateralConfiguration.decimals)
          )
        )
        .toString()
    );

    if (positionSnapshot.collateralAmount.lt(0)) {
      positionSnapshot.collateralAmount = BigDecimal(0);
    }

    await ctx.store.upsert(positionSnapshot);

    // Pool snapshot
    const poolSnapshotId = `${ctx.chainId}_${ctx.contractAddress}_${collateralConfiguration.assetAddress}`;
    const poolSnapshot = await ctx.store.get(PoolSnapshot, poolSnapshotId);

    if (!poolSnapshot) {
      throw new Error(
        `Pool snapshot not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    poolSnapshot.collateralAmount = BigDecimal(
      poolSnapshot.collateralAmount
    ).minus(
      BigDecimal(amount.toString()).dividedBy(
        BigDecimal(10).pow(collateralConfiguration.decimals)
      )
    );

    await ctx.store.upsert(poolSnapshot);
  })
  .onLogUserLiquidatedEvent(async (event, ctx) => {
    const {
      data: { address, base_paid_out },
    } = event;

    const marketConfigId = `${ctx.chainId}_${ctx.contractAddress}`;
    const marketConfiguration = await ctx.store.get(
      MarketConfiguration,
      marketConfigId
    );

    if (!marketConfiguration) {
      throw new Error(
        `Market configuration not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}`;

    const positionSnapshot = await ctx.store.get(PositionSnapshot, id);

    if (!positionSnapshot) {
      throw new Error(
        `Position snapshot (${id}) not found for user ${address.bits} on chain ${ctx.chainId}`
      );
    }

    positionSnapshot.collateralAmount = BigDecimal(0);
    positionSnapshot.suppliedAmount = BigDecimal(base_paid_out.toString())
      .dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals))
      .minus(positionSnapshot.borrowedAmount);

    positionSnapshot.borrowedAmount = BigDecimal(0);

    if (positionSnapshot.suppliedAmount.lt(0)) {
      positionSnapshot.suppliedAmount = BigDecimal(0);
    }

    await ctx.store.upsert(positionSnapshot);
  })
  .onLogMarketBasicEvent(async (event, ctx) => {
    const {
      data: {
        market_basic: {
          base_supply_index,
          base_borrow_index,
          total_supply_base,
          total_borrow_base,
        },
      },
    } = event;

    const marketConfigId = `${ctx.chainId}_${ctx.contractAddress}`;
    const marketConfiguration = await ctx.store.get(
      MarketConfiguration,
      marketConfigId
    );

    if (!marketConfiguration) {
      throw new Error(
        `Market configuration not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    const poolSnapshotId = `${ctx.chainId}_${ctx.contractAddress}_${marketConfiguration.baseTokenAddress}`;
    const poolSnapshot = await ctx.store.get(PoolSnapshot, poolSnapshotId);

    if (!poolSnapshot) {
      throw new Error(
        `Pool snapshot not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    // Indexes
    poolSnapshot.supplyIndex = BigDecimal(
      base_supply_index.toString()
    ).dividedBy(FACTOR_SCALE_15);
    poolSnapshot.borrowIndex = BigDecimal(
      base_borrow_index.toString()
    ).dividedBy(FACTOR_SCALE_15);

    // Supplied amount and available amount
    poolSnapshot.suppliedAmount = BigDecimal(
      total_supply_base.toString()
    ).dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals));
    poolSnapshot.nonRecursiveSuppliedAmount = BigDecimal(
      total_supply_base.toString()
    ).dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals));
    poolSnapshot.availableAmount = BigDecimal(total_supply_base.toString())
      .minus(BigDecimal(total_borrow_base.toString()))
      .dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals));

    // Calculate utilization
    let utilization = BigDecimal(0);
    if (poolSnapshot.suppliedAmount.gt(0)) {
      utilization = poolSnapshot.borrowedAmount.dividedBy(
        poolSnapshot.suppliedAmount
      );
    }

    // Calculate borrow rate and APR
    const borrowRate = geBorrowRate(marketConfiguration, utilization);
    const borrowApr = borrowRate
      .dividedBy(FACTOR_SCALE_18)
      .times(SECONDS_PER_YEAR)
      .decimalPlaces(0, BigDecimal.ROUND_FLOOR);
    poolSnapshot.borrowApr = borrowApr;

    // Calculate supply rate and APR
    const supplyRate = getSupplyRate(marketConfiguration, utilization);
    const supplyApr = supplyRate
      .dividedBy(FACTOR_SCALE_18)
      .times(SECONDS_PER_YEAR)
      .decimalPlaces(0, BigDecimal.ROUND_FLOOR);
    poolSnapshot.supplyApr = supplyApr;

    await ctx.store.upsert(poolSnapshot);
  })
  .onLogAbsorbCollateralEvent(async (event, ctx) => {
    const {
      data: { asset_id, amount, decimals },
    } = event;

    const poolSnapshotId = `${ctx.chainId}_${ctx.contractAddress}_${asset_id}`;
    const poolSnapshot = await ctx.store.get(PoolSnapshot, poolSnapshotId);

    if (!poolSnapshot) {
      throw new Error(
        `Pool snapshot not found for market ${ctx.contractAddress} on chain ${ctx.chainId}`
      );
    }

    poolSnapshot.collateralAmount = BigDecimal(
      poolSnapshot.collateralAmount
    ).minus(
      BigDecimal(amount.toString()).dividedBy(BigDecimal(10).pow(decimals))
    );

    await ctx.store.upsert(poolSnapshot);
  });
