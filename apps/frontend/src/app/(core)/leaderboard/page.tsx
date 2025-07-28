import { LeaderboardView } from '@/components/v1/LeaderboardView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
};

export default function Page() {
  return <LeaderboardView />;
}
