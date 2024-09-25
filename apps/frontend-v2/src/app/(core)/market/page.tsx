import { MarketsTable } from '@/components/MarketsView/MarketsTable';
import { MultiMarketChart } from '@/components/MarketsView/MultiMarketChart';
import { useChartsData } from '@/hooks/useChartsData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market',
};

export default async function Page() {
  const chartsData = await useChartsData();

  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <div className="w-full flex justify-center items-center gap-x-4">
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="text-white text-md font-normal">Earning</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-purple" />
          <div className="text-white text-md font-normal">Borrowing</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
          <div className="text-white text-md font-normal">Collateral</div>
        </div>
      </div>
      <div className="w-full h-[320px] mt-12 mb-[125px]">
        <MultiMarketChart chartData={chartsData?.merged} />
      </div>
      <MarketsTable />
    </div>
  );
}
