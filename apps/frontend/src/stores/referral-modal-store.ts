import { create } from 'zustand';
import { createSelectors } from './create-selectors';

type ReferralModalStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const referralModalStoreInitialState = {
  open: false,
};

const useReferralModalStoreBase = create<ReferralModalStore>()((set) => ({
  ...referralModalStoreInitialState,
  setOpen: (open: boolean) => set({ open }),
}));

export const useReferralModalStore = createSelectors(useReferralModalStoreBase);
