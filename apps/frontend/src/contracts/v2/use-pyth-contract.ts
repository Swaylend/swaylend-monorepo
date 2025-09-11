import {
  selectPythContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/v2/market-address-based-contract-store';

export function usePythContract(market: string) {
  const pythContract = useMarketAddressBasedContractsStore((store) =>
    selectPythContract(store, market)
  );

  return pythContract;
}
