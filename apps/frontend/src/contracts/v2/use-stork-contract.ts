import {
  selectStorkContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/v2/market-address-based-contract-store';

export function useStorkContract(market: string) {
  const storkContract = useMarketAddressBasedContractsStore((store) =>
    selectStorkContract(store, market)
  );

  return storkContract;
}
