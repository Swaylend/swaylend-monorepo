import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bridge',
};

export default function Page() {
  return (
    <div className="h-full w-full py-4 md:px-4">
      <iframe
        className="scrollbar-none h-[60vh] w-full rounded-2xl border-0 md:h-[85vh]"
        src="https://layerswap.io/app/?&to=FUEL_MAINNET&from=ETHEREUM_MAINNET"
        title="mira.ly"
      />
    </div>
  );
}
