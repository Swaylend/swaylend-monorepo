import type BigNumber from 'bignumber.js';
import { Line } from '../Line';

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
    <div className="min-w-[200px] max-w-[300px] py-2 px-4">
      <div className="flex justify-center font-semibold text-white text-lg">
        Net Borrow APY
      </div>
      <div className="mt-4 flex flex-col font-normal">
        <div className="flex justify-between text-md">
          <div>Borrow APY</div>
          <div>{aprData?.borrowBaseApr.times(100).toFixed(2)}%</div>
        </div>
        <div className="flex justify-between text-md pb-2">
          <div className="flex flex-col gap-y-1">
            <div>Reward APY</div>
            <div className="text-xs italic text-moon">Distributed in $FUEL</div>
          </div>
          <div>- {aprData?.borrowRewardApr.times(100).toFixed(2)}%</div>
        </div>
      </div>
      <Line />
      <div className="flex justify-between text-md font-normal pt-1">
        <div>Net Borrow APY</div>
        <div>{aprData?.netBorrowApr.times(100).toFixed(2)}%</div>
      </div>
      <div className="mt-1 text-center text-xs italic text-moon">
        A negative Net Borrow APY means you are earning interest on your
        borrowed funds.
      </div>
    </div>
  );
};
