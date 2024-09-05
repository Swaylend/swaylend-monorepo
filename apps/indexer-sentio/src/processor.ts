import { FuelNetwork } from '@sentio/sdk/fuel';
import { MarketProcessor } from './types/fuel/MarketProcessor.js';
import {
  CollateralConfiguration,
  MarketConfiguration,
  PositionSnapshot,
} from './schema/store.js';
import { BigDecimal } from '@sentio/sdk';

// TODO: Add liquidation events
MarketProcessor.bind({
  chainId: FuelNetwork.TEST_NET,
  address: '0xea9d4a55ca16271f42992529bb68de095249ceb8d95176576098bb9b98cd3975',
  startBlock: BigInt(7597567),
})
  .onLogMarketConfigurationEvent(async (event, ctx) => {
    const {
      data: {
        market_config: { base_token, base_token_decimals },
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
      });
    } else {
      marketConfiguration.baseTokenAddress = base_token;
      marketConfiguration.baseTokenDecimals = base_token_decimals;
      marketConfiguration.chainId = ctx.chainId;
      marketConfiguration.contractAddress = ctx.contractAddress;
    }

    await ctx.store.upsert(marketConfiguration);
  })
  .onLogCollateralAssetAdded(async (event, ctx) => {
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
        suppliedAmount: BigInt(supply_amount.toString()),
        borrowedAmount: BigInt(0),
        collateralAmount: BigInt(0),
      });
    } else {
      if (supply_amount.gt(0)) {
        positionSnapshot.suppliedAmount = BigInt(
          positionSnapshot.suppliedAmount
            .asBigDecimal()
            .plus(BigDecimal(supply_amount.toString()))
            .toString()
        );
      }

      if (repay_amount.gt(0)) {
        positionSnapshot.borrowedAmount = BigInt(
          positionSnapshot.borrowedAmount
            .asBigDecimal()
            .minus(BigDecimal(repay_amount.toString()))
            .toString()
        );

        if (positionSnapshot.borrowedAmount.asBigDecimal().lt(0)) {
          positionSnapshot.borrowedAmount = BigInt(0);
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
        suppliedAmount: BigInt(0),
        borrowedAmount: BigInt(borrow_amount.toString()),
        collateralAmount: BigInt(0),
      });
    } else {
      if (borrow_amount.gt(0)) {
        positionSnapshot.borrowedAmount = BigInt(
          positionSnapshot.borrowedAmount
            .asBigDecimal()
            .plus(BigDecimal(borrow_amount.toString()))
            .toString()
        );
      }

      if (withdraw_amount.gt(0)) {
        positionSnapshot.suppliedAmount = BigInt(
          positionSnapshot.suppliedAmount
            .asBigDecimal()
            .minus(BigDecimal(withdraw_amount.toString()))
            .toString()
        );

        if (positionSnapshot.suppliedAmount.asBigDecimal().lt(0)) {
          positionSnapshot.suppliedAmount = BigInt(0);
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
        suppliedAmount: BigInt(0),
        borrowedAmount: BigInt(0),
        collateralAmount: BigInt(amount.toString()),
      });
    } else {
      positionSnapshot.collateralAmount = BigInt(
        positionSnapshot.collateralAmount
          .asBigDecimal()
          .plus(BigDecimal(amount.toString()))
          .toString()
      );
    }

    await ctx.store.upsert(positionSnapshot);
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

    positionSnapshot.collateralAmount = BigInt(
      positionSnapshot.collateralAmount
        .asBigDecimal()
        .minus(BigDecimal(amount.toString()))
        .toString()
    );

    if (positionSnapshot.collateralAmount.asBigDecimal().lt(0)) {
      positionSnapshot.collateralAmount = BigInt(0);
    }

    await ctx.store.upsert(positionSnapshot);
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

    positionSnapshot.collateralAmount = BigInt(0);
    positionSnapshot.suppliedAmount = BigInt(
      BigDecimal(base_paid_out.toString())
        .minus(positionSnapshot.borrowedAmount.asBigDecimal())
        .toString()
    );
    positionSnapshot.borrowedAmount = BigInt(0);

    if (positionSnapshot.suppliedAmount.asBigDecimal().lt(0)) {
      positionSnapshot.suppliedAmount = BigInt(0);
    }

    await ctx.store.upsert(positionSnapshot);
  });
