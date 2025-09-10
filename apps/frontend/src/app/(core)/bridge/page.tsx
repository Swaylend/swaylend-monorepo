import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bridge',
};

export default async function Page() {
  return (
    <div className="w-full h-full py-4 md:px-4">
      <iframe
        title="Layerswap"
        className="w-full h-[60vh] md:h-[85vh] rounded-2xl border-0 scrollbar-none"
        src="https://layerswap.io/app/?&to=FUEL_MAINNET&from=ETHEREUM_MAINNET"
      />
    </div>
  );
}
