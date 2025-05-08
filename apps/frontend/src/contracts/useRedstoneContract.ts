import {
  selectRedstoneContract,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';

export function useRedstoneContract(market: string) {
  const redstoneContract = useMarketAddressBasedContractsStore((store) =>
    selectRedstoneContract(store, market)
  );
  return redstoneContract;
}
