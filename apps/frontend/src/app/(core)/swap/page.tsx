import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swap',
};

export default function Page() {
  return (
    <div className="h-full w-full p-4">
      <iframe
        allowTransparency={true}
        className="scrollbar-none h-[75vh] w-full rounded-2xl border-0 md:h-[85vh]"
        src="https://mira.ly/widget/"
        title="mira.ly"
      />
    </div>
  );
}
