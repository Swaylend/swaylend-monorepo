import {
  selectRedstoneContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/v2/market-address-based-contract-store';

export function useRedstoneContract(market: string) {
  const redstoneContract = useMarketAddressBasedContractsStore((store) =>
    selectRedstoneContract(store, market)
  );

  return redstoneContract;
}
