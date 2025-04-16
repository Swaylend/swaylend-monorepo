import { create } from 'zustand';

interface BanxaDialogStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const banxaDialogStoreInitialState = {
  open: false,
};

export const useBanxaDialogStore = create<BanxaDialogStore>()((set) => ({
  ...banxaDialogStoreInitialState,
  setOpen: (open: boolean) => set({ open }),
}));

export const selectBanxaDialogOpen = (state: BanxaDialogStore) => state.open;

export const selectBanxaDialogSetOpen = (state: BanxaDialogStore) =>
  state.setOpen;
