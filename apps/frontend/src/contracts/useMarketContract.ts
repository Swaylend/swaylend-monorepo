import {
  selectMarketContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';

export function useMarketContract() {
  const marketContract =
    useMarketAddressBasedContractsStore(selectMarketContract);
  return marketContract;
}
