'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserHistory } from '@/hooks/v1';
import React from 'react';
import { UserHistoryChart } from './user-history-chart';

export const Chart = ({ lastRow }: { lastRow: any }) => {
  const { data: userHistory, isPending: isPendingTxHistory } = useUserHistory();

  if (isPendingTxHistory) {
    return <Skeleton className="w-4 h-12" />;
  }

  return <UserHistoryChart lastRow={lastRow} chartData={userHistory} />;
};
