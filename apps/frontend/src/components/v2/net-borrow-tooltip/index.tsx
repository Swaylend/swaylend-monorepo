import type BigNumber from 'bignumber.js';
import { Line } from '../line';

type NetBorrowTooltipProps = {
  aprData:
    | {
        supplyBaseApr: BigNumber;
        borrowBaseApr: BigNumber;
        supplyRewardApr: BigNumber;
        borrowRewardApr: BigNumber;
        netSupplyApr: BigNumber;
        netBorrowApr: BigNumber;
      }
    | undefined;
};

export const NetBorrowTooltip = ({ aprData }: NetBorrowTooltipProps) => {
  return (
    <div className="min-w-[200px] max-w-[300px] px-4 py-2">
      <div className="flex justify-center font-semibold text-lg text-white">
        Net Borrow APY
      </div>
      <div className="mt-4 flex flex-col font-normal">
        <div className="flex justify-between text-md">
          <div>Borrow APY</div>
          <div>{aprData?.borrowBaseApr.times(100).toFixed(2)}%</div>
        </div>
        <div className="flex justify-between pb-2 text-md">
          <div className="flex flex-col gap-y-1">
            <div>Reward APY</div>
            <div className="text-moon text-xs italic">Distributed in $FUEL</div>
          </div>
          <div>- {aprData?.borrowRewardApr.times(100).toFixed(2)}%</div>
        </div>
      </div>
      <Line />
      <div className="flex justify-between pt-1 font-normal text-md">
        <div>Net Borrow APY</div>
        <div>{aprData?.netBorrowApr.times(100).toFixed(2)}%</div>
      </div>
      <div className="mt-1 text-center text-moon text-xs italic">
        A negative Net Borrow APY means you are earning interest on your
        borrowed funds.
      </div>
    </div>
  );
};
