import { create } from 'zustand';
import { createSelectors } from './create-selectors';

interface VersionStore {
  version: string;
  changeVersion: (version: string) => void;
  toggleVersion: () => void;
}

export const versionStoreInitialState = {
  version: 'v2',
};

const useVersionStoreBase = create<VersionStore>((set) => ({
  ...versionStoreInitialState,
  changeVersion: (version: string) => set({ version }),
  toggleVersion: () =>
    set((state) => ({ version: state.version === 'v1' ? 'v2' : 'v1' })),
}));

export const useVersionStore = createSelectors(useVersionStoreBase);
