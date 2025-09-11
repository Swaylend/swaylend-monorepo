import {
  selectMarketContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/v2/market-address-based-contract-store';

export function useMarketContract(market: string) {
  const marketContract = useMarketAddressBasedContractsStore((store) =>
    selectMarketContract(store, market)
  );
  return marketContract;
}
