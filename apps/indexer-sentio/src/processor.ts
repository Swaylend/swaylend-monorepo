import { BigDecimal } from '@sentio/sdk';
import { FuelNetwork } from '@sentio/sdk/fuel';
import {
  CollateralConfiguration,
  MarketConfiguration,
  Pool,
  PoolSnapshot,
  PositionSnapshot,
} from './schema/store.js';
import { MarketProcessor } from './types/fuel/MarketProcessor.js';

// TODO: Add liquidation events
MarketProcessor.bind({
  chainId: FuelNetwork.TEST_NET,
  address: '0xea9d4a55ca16271f42992529bb68de095249ceb8d95176576098bb9b98cd3975',
  startBlock: BigInt(7597567),
})
  .onLogMarketConfigurationEvent(async (event, ctx) => {
    const {
      data: {
        market_config: {
          base_token,
          base_token_decimals,
          base_tracking_index_scale,
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
        baseTrackingIndexScale: BigDecimal(
          base_tracking_index_scale.toString()
        ),
      });
    } else {
      marketConfiguration.baseTokenAddress = base_token;
      marketConfiguration.baseTokenDecimals = base_token_decimals;
      marketConfiguration.chainId = ctx.chainId;
      marketConfiguration.contractAddress = ctx.contractAddress;
      marketConfiguration.baseTrackingIndexScale = BigDecimal(
        base_tracking_index_scale.toString()
      );
    }

    await ctx.store.upsert(marketConfiguration);

    // Create pool if it doesn't exist
    const poolId = `${ctx.chainId}_${ctx.contractAddress}_${base_token}`;
    const pool = await ctx.store.get(Pool, poolId);

    if (!pool) {
      const pool = new Pool({
        id: poolId,
        chainId: ctx.chainId,
        underlyingTokenAddress: base_token,
        underlyingTokenSymbol: 'TODO',
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
        underlyingTokenSymbol: 'TODO',
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
      const pool = new Pool({
        id: poolId,
        chainId: ctx.chainId,
        underlyingTokenAddress: asset_id,
        underlyingTokenSymbol: 'TODO',
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
        underlyingTokenSymbol: 'TODO',
        underlyingTokenPriceUsd: BigDecimal(0),
        availableAmount: BigDecimal(0),
        availableAmountUsd: BigDecimal(0),
        suppliedAmount: BigDecimal(0),
        suppliedAmountUsd: BigDecimal(0),
        nonRecursiveSuppliedAmount: BigDecimal(0),
        collateralAmount: BigDecimal(0),
        collateralAmountUsd: BigDecimal(0),
        collateralFactor: BigDecimal(borrow_collateral_factor.toString()),
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
        underlyingTokenSymbol: 'USDC',
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
        underlyingTokenSymbol: marketConfiguration.baseTokenAddress,
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
        underlyingTokenSymbol: collateralConfiguration.assetAddress,
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
    // TODO: Pool snapshot
  })
  .onLogMarketBasicEvent(async (event, ctx) => {
    const {
      data: {
        market_basic: {
          tracking_supply_index,
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

    poolSnapshot.supplyIndex = BigDecimal(
      tracking_supply_index.toString()
    ).dividedBy(marketConfiguration.baseTrackingIndexScale);
    poolSnapshot.suppliedAmount = BigDecimal(
      total_supply_base.toString()
    ).dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals));
    poolSnapshot.nonRecursiveSuppliedAmount = BigDecimal(
      total_supply_base.toString()
    ).dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals));
    poolSnapshot.availableAmount = BigDecimal(total_supply_base.toString())
      .minus(BigDecimal(total_borrow_base.toString()))
      .dividedBy(BigDecimal(10).pow(marketConfiguration.baseTokenDecimals));

    // TODO: Move `get_borrow_rate` and `get_supply_rate` logic from contract to here
    // TODO: Move utulization logic from contract to here
  });
