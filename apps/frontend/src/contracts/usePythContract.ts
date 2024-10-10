import {
  selectPythContract,
  useMarketAddressBasedContracts,
} from '@/stores/marketAddressBasedContracts';

export function usePythContract() {
  const pythContract = useMarketAddressBasedContracts(selectPythContract);
  return pythContract;
}
