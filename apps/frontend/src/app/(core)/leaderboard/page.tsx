import type { Metadata } from 'next';
import { LeaderboardView } from '@/components/v1/leaderboard-view';

export const metadata: Metadata = {
  title: 'Leaderboard',
};

export default function Page() {
  return <LeaderboardView />;
}
