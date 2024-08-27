import { FuelNetwork } from '@sentio/sdk/fuel';
import { MarketProcessor } from './types/fuel/MarketProcessor.js';

MarketProcessor.bind({
  chainId: FuelNetwork.TEST_NET,
  address: '0x40306bb23caad2dceb3907d62f50d75a0d8cd5e7a01b2f3e4189d3a54be42e40',
  startBlock: BigInt(8386611),
})
  .onLogMarketConfigurationEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('MarketConfiguration', {
      logId,
      receiptIndex,
      data,
    });
  })
  .onLogMarketBasicEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('MarketBasic', {
      logId,
      receiptIndex,
      data,
    });
  })
  .onLogUserSupplyBaseEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserSupplyBase', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data,
    });
  })
  .onLogUserSupplyCollateralEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserSupplyCollateral', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data,
    });
  })
  .onLogUserWithdrawBaseEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserWithdrawBase', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data,
    });
  })
  .onLogUserWithdrawCollateralEvent(async (event, ctx) => {
    const { logId, receiptIndex, data } = event;

    ctx.eventLogger.emit('UserWithdrawCollateral', {
      distinctId: ctx.transaction?.sender,
      logId,
      receiptIndex,
      data,
    });
  });
