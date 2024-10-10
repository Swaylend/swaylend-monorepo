import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { Market } from '@/contract-types';
import { createWithEqualityFn } from 'zustand/traditional';
import { useProviderStore } from '@/stores/providerStore';
import { shallow } from 'zustand/shallow';
import { appConfig } from '@/configs';
import { useMarketStore } from '@/stores/marketStore';

interface Store {
  marketAddress: string | undefined;
  pythContract: PythContract | undefined;
  marketContract: Market | undefined;
  updateContracts: (marketAddress?: string) => void;
  fetchAndSetMarketAddress: (marketAddress?: string) => void;
}

export const marketStoreInitialState = {
  marketAddress: undefined,
  pythContract: undefined,
  marketContract: undefined,
};

/**
 * This store is used to store the market address based contracts.
 * Values shouldn't need to be updated manually or from outside the store subscribers.
 * This was created in order to avoid unnecessary rerenders and contract recreations.
 */
export const useMarketAddressBasedContracts = createWithEqualityFn<Store>()(
  (set, get) => ({
    ...marketStoreInitialState,

    updateContracts: (_marketAddress) => {
      const marketAddress = _marketAddress || get().marketAddress;
      const provider = useProviderStore.getState().provider;
      if (!provider || !marketAddress) {
        return;
      }
      console.log('fsk creating contracts');
      const pythContract = new PythContract(
        appConfig.markets[marketAddress].oracleAddress,
        provider
      );
      const marketContract = new Market(
        appConfig.markets[marketAddress].marketAddress,
        provider
      );
      set({ pythContract, marketContract });
    },
    fetchAndSetMarketAddress: (_marketAddress) => {
      const marketAddress = _marketAddress || useMarketStore.getState().market;
      const provider = useProviderStore.getState().provider;
      if (!marketAddress) return;
      set({ marketAddress });
      if (!provider) return;
      get().updateContracts(marketAddress);
    },
  }),
  shallow
);

// Initialize
useMarketAddressBasedContracts.getState().fetchAndSetMarketAddress();

// Update when provider changes
useProviderStore.subscribe((prevState, newState) => {
  const {
    marketContract,
    pythContract,
    marketAddress,
    updateContracts,
    fetchAndSetMarketAddress,
  } = useMarketAddressBasedContracts.getState();
  const unitialized = !marketContract && !pythContract;
  const newProviderIsValid = !!newState.provider;
  // Initialize if provider changes, or if data is not initialized
  if (
    prevState.provider !== newState.provider &&
    (newProviderIsValid || unitialized)
  ) {
    if (marketAddress) {
      updateContracts();
      return;
    }
    fetchAndSetMarketAddress();
  }
});

// Update when market address changes
useMarketStore.subscribe((prevState, newState) => {
  const { marketAddress: currentMarketAddress, fetchAndSetMarketAddress } =
    useMarketAddressBasedContracts.getState();
  if (
    prevState.market !== newState.market &&
    newState.market !== currentMarketAddress
  ) {
    fetchAndSetMarketAddress(newState.market);
  }
});

export const selectMarketContract = (state: Store) => state.marketContract;
export const selectPythContract = (state: Store) => state.pythContract;
