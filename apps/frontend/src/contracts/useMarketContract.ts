import {
  selectMarketContract,
  useMarketAddressBasedContracts,
} from '@/stores/marketAddressBasedContracts';

export function useMarketContract() {
  const marketContract = useMarketAddressBasedContracts(selectMarketContract);
  return marketContract;
}
