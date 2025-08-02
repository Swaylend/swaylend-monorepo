'use client';

import { PortfolioView as PortfolioViewV1 } from '@/components/v1/portfolio-view';
import { PortfolioView as PortfolioViewV2 } from '@/components/v2/portfolio-view';
import { useVersionStore } from '@/stores/version-store';

export const ClientView = () => {
  const version = useVersionStore.use.version();
  return version === 'v1' ? <PortfolioViewV1 /> : <PortfolioViewV2 />;
};
