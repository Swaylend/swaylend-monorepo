import { FuelNetwork } from '@sentio/sdk/fuel';
import { MarketProcessor } from './types/fuel/MarketProcessor.js';
import { BigDecimal } from '@sentio/sdk/core';

MarketProcessor.bind({
  chainId: FuelNetwork.TEST_NET,
  address: '0xea9d4a55ca16271f42992529bb68de095249ceb8d95176576098bb9b98cd3975',
  startBlock: BigInt(7597567),
})

  .onLogUserSupplyBaseEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserSupplyBase', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data: {
        ...data,
        supply_amount: BigDecimal(data.supply_amount.toString()),
        repay_amount: BigDecimal(data.repay_amount.toString()),
      },
    });
  })
  .onLogUserSupplyCollateralEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserSupplyCollateral', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data: {
        ...data,
        amount: BigDecimal(data.amount.toString()),
      },
    });
  })
  .onLogUserWithdrawBaseEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserWithdrawBase', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data: {
        ...data,
        withdraw_amount: BigDecimal(data.withdraw_amount.toString()),
        borrow_amount: BigDecimal(data.borrow_amount.toString()),
      },
    });
  })
  .onLogUserWithdrawCollateralEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserWithdrawCollateral', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data: {
        ...data,
        amount: BigDecimal(data.amount.toString()),
      },
    });
  });
