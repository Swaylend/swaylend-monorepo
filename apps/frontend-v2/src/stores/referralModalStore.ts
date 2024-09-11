import type { Provider } from 'fuels';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

interface ReferralModalStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const referralModalStoreInitialState = {
  open: false,
};

export const useReferralModalStore = createWithEqualityFn<ReferralModalStore>()(
  (set) => ({
    ...referralModalStoreInitialState,
    setOpen: (open: boolean) => set({ open }),
  }),
  shallow
);
