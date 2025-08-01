import type { Metadata } from 'next';
import { ClientView } from './client';

export const metadata: Metadata = {
  title: { absolute: 'Swaylend | Lending reimagined' },
};

export default function Home() {
  return (
    <div className="max-h-full">
      <ClientView />
    </div>
  );
}
