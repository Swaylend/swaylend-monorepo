import { create } from 'zustand';

interface ReferralModalStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const referralModalStoreInitialState = {
  open: false,
};

export const useReferralModalStore = create<ReferralModalStore>()((set) => ({
  ...referralModalStoreInitialState,
  setOpen: (open: boolean) => set({ open }),
}));

export const selectReferralModalOpen = (state: ReferralModalStore) =>
  state.open;

export const selectReferralModalSetOpen = (state: ReferralModalStore) =>
  state.setOpen;
