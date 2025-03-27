import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swap',
};

export default async function Page() {
  return (
    <div className="w-full h-full p-4">
      <iframe
        title="mira.ly"
        allowTransparency={true}
        className="w-full h-[75vh] md:h-[85vh] rounded-2xl border-0 scrollbar-none"
        src="https://mira.ly/widget/"
      />
    </div>
  );
}
