'use client';

import { DashboardView as DashboardViewV1 } from '@/components/v1/dashboard-view';
import { DashboardView as DashboardViewV2 } from '@/components/v2/dashboard-view';
import { useVersionStore } from '@/stores/version-store';

export const ClientView = () => {
  const version = useVersionStore.use.version();
  return version === 'v1' ? <DashboardViewV1 /> : <DashboardViewV2 />;
};
