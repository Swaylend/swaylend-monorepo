import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Swaylend',
  },
};

export default function Page() {
  return (
    <div className="h-screen flex justify-center items-center text-primary">
      This page is blocked in your country.
    </div>
  );
}
