import { LeaderboardView } from '@/components/LeaderboardView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
};

export default function Page() {
  return <LeaderboardView />;
}
