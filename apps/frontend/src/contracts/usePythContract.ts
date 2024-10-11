import {
  selectPythContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';

export function usePythContract() {
  const pythContract = useMarketAddressBasedContractsStore(selectPythContract);
  return pythContract;
}
