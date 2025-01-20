import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swap',
};

export default async function Page() {
  return (
    <div className="w-full h-full p-4">
      <iframe
        title="mira.ly"
        className="w-full h-screen rounded-2xl border-0 scrollbar-none"
        src="https://mira.ly/"
      />
    </div>
  );
}
