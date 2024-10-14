import {
  selectPythContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';

export function usePythContract(market: string) {
  const pythContract = useMarketAddressBasedContractsStore((store) =>
    selectPythContract(store, market)
  );
  return pythContract;
}
