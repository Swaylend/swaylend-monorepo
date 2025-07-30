'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserHistory } from '@/hooks/v1';
import { UserHistoryChart } from './user-history-chart';

export const Chart = ({ lastRow }: { lastRow: any }) => {
  const { data: userHistory, isPending: isPendingTxHistory } = useUserHistory();

  if (isPendingTxHistory) {
    return <Skeleton className="h-12 w-4" />;
  }

  return <UserHistoryChart chartData={userHistory} lastRow={lastRow} />;
};
