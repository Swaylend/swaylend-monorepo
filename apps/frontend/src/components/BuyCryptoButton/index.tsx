'use client';

import { selectBanxaDialogSetOpen, useBanxaDialogStore } from '@/stores';
import { Button } from '../ui/button';

export const BuyCryptoButton = () => {
  const setOpen = useBanxaDialogStore(selectBanxaDialogSetOpen);

  return <Button onClick={() => setOpen(true)}>Buy Crypto</Button>;
};
