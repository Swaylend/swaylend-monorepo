import {
  selectMarketContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';

export function useMarketContract(market: string) {
  const marketContract = useMarketAddressBasedContractsStore((store) =>
    selectMarketContract(store, market)
  );
  return marketContract;
}
