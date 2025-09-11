import { createLoader, parseAsString } from 'nuqs/server';

export const portfolioViewParams = {
  view: parseAsString.withDefault('markets'),
};

export const loadPortfolioViewParams = createLoader(portfolioViewParams);
