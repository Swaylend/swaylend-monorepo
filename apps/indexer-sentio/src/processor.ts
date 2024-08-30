import { FuelNetwork } from '@sentio/sdk/fuel';
import { MarketProcessor } from './types/fuel/MarketProcessor.js';
import { UserBasePosition, UserCollateralPosition } from './schema/store.js';
import { BigDecimal } from '@sentio/sdk';

MarketProcessor.bind({
  chainId: FuelNetwork.TEST_NET,
  address: '0xea9d4a55ca16271f42992529bb68de095249ceb8d95176576098bb9b98cd3975',
  startBlock: BigInt(7597567),
})
  .onLogUserSupplyBaseEvent(async (event, ctx) => {
    const {
      data: { address, repay_amount, supply_amount },
    } = event;

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}`;

    let userBasePosition = await ctx.store.get(UserBasePosition, id);

    if (!userBasePosition) {
      userBasePosition = new UserBasePosition({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        userAddress: address.bits,
        baseAmount: BigInt(supply_amount.toString()),
      });
    } else {
      // If both repay_amount and supply_amount are greater than 0, use supply_amount
      if (supply_amount.gt(0)) {
        if (userBasePosition.baseAmount.asBigDecimal().lt(0)) {
          userBasePosition.baseAmount = BigInt(supply_amount.toString());
        } else {
          userBasePosition.baseAmount = BigInt(
            userBasePosition.baseAmount
              .asBigDecimal()
              // .plus(supply_amount.asBigDecimal())
              .plus(BigDecimal(supply_amount.toString()))
              .toString()
          );
        }
      } else {
        userBasePosition.baseAmount = BigInt(
          userBasePosition.baseAmount
            .asBigDecimal()
            // .plus(supply_amount.asBigDecimal())
            .plus(BigDecimal(repay_amount.toString()))
            .toString()
        );

        // Can't repay more than the user has borrowed
        if (userBasePosition.baseAmount.asBigDecimal().gt(0)) {
          userBasePosition.baseAmount = BigInt(0);
        }
      }
    }

    await ctx.store.upsert(userBasePosition);
  })
  .onLogUserWithdrawBaseEvent(async (event, ctx) => {
    const {
      data: { address, borrow_amount, withdraw_amount },
    } = event;

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}`;

    let userBasePosition = await ctx.store.get(UserBasePosition, id);

    if (!userBasePosition) {
      userBasePosition = new UserBasePosition({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        userAddress: address.bits,
        baseAmount: BigInt(borrow_amount.toString()),
      });
    } else {
      // If both borrow_amount and withdraw_amount are greater than 0, use borrow_amount
      if (borrow_amount.gt(0)) {
        // If user borrows and baseAmount is greater than 0, user has also withdrawn everything
        if (userBasePosition.baseAmount.asBigDecimal().gt(0)) {
          userBasePosition.baseAmount = BigInt(0);
        }

        userBasePosition.baseAmount = BigInt(
          userBasePosition.baseAmount
            .asBigDecimal()
            // .minus(withdraw_amount.asBigDecimal())
            .minus(BigDecimal(borrow_amount.toString()))
            .toString()
        );
      } else {
        userBasePosition.baseAmount = BigInt(
          userBasePosition.baseAmount
            .asBigDecimal()
            // .minus(withdraw_amount.asBigDecimal())
            .minus(BigDecimal(withdraw_amount.toString()))
            .toString()
        );

        // Can't withdraw more than the user has available
        if (userBasePosition.baseAmount.asBigDecimal().lt(0)) {
          userBasePosition.baseAmount = BigInt(0);
        }
      }
    }

    await ctx.store.upsert(userBasePosition);
  })
  .onLogUserSupplyCollateralEvent(async (event, ctx) => {
    const {
      data: { address, asset_id, amount },
    } = event;

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}_${asset_id}`;

    let userCollateralPosition = await ctx.store.get(
      UserCollateralPosition,
      id
    );

    if (!userCollateralPosition) {
      userCollateralPosition = new UserCollateralPosition({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        userAddress: address.bits,
        collateralAssetAddress: asset_id,
        collateralAmount: BigInt(amount.toString()),
      });
    } else {
      userCollateralPosition.collateralAmount = BigInt(
        userCollateralPosition.collateralAmount
          .asBigDecimal()
          // .plus(amount.asBigDecimal())
          .plus(BigDecimal(amount.toString()))
          .toString()
      );
    }

    await ctx.store.upsert(userCollateralPosition);
  })

  .onLogUserWithdrawCollateralEvent(async (event, ctx) => {
    const {
      data: { address, asset_id, amount },
    } = event;

    const id = `${ctx.chainId}_${ctx.contractAddress}_${address.bits}_${asset_id}`;

    let userCollateralPosition = await ctx.store.get(
      UserCollateralPosition,
      id
    );

    if (!userCollateralPosition) {
      userCollateralPosition = new UserCollateralPosition({
        id,
        chainId: ctx.chainId,
        poolAddress: ctx.contractAddress,
        userAddress: address.bits,
        collateralAssetAddress: asset_id,
        collateralAmount: BigInt(amount.toString()),
      });
    } else {
      userCollateralPosition.collateralAmount = BigInt(
        userCollateralPosition.collateralAmount
          .asBigDecimal()
          // .minus(amount.asBigDecimal())
          .minus(BigDecimal(amount.toString()))
          .toString()
      );

      // Can't withdraw more than the user has available
      if (userCollateralPosition.collateralAmount.asBigDecimal().lt(0)) {
        userCollateralPosition.collateralAmount = BigInt(0);
      }
    }

    await ctx.store.upsert(userCollateralPosition);
  });
