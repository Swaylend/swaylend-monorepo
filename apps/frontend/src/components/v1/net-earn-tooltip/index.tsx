import type BigNumber from 'bignumber.js';
import { Line } from '../line';

type NetEarnTooltipProps = {
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

export const NetEarnTooltip = ({ aprData }: NetEarnTooltipProps) => {
  return (
    <div className="min-w-[200px] p-2">
      <div className="flex justify-center font-semibold text-lg text-white">
        Net Earn APY
      </div>
      <div className="mt-4 flex flex-col font-normal">
        <div className="flex justify-between text-md">
          <div>Earn APY</div>
          <div>{aprData?.supplyBaseApr.times(100).toFixed(2)}%</div>
        </div>
        <div className="flex justify-between pb-2 text-md">
          <div className="flex flex-col gap-y-1">
            <div>Reward APY</div>
            <div className="text-moon text-xs italic">Distributed in $FUEL</div>
          </div>
          <div>+ {aprData?.supplyRewardApr.times(100).toFixed(2)}%</div>
        </div>
        <Line />
        <div className="flex justify-between pt-1 font-normal text-md">
          <div>Net Earn APY</div>
          <div>{aprData?.netSupplyApr.times(100).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
};
