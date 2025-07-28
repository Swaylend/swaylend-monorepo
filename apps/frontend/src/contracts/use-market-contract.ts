import {
  selectMarketContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/market-address-based-contract-store';

export function useMarketContract(market: string) {
  const marketContract = useMarketAddressBasedContractsStore((store) =>
    selectMarketContract(store, market)
  );
  return marketContract;
}
