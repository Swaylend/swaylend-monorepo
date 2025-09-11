import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Swaylend',
  },
};

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center text-primary">
      This page is blocked in your country.
    </div>
  );
}
