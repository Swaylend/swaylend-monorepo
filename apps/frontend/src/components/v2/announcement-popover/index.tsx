'use client';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Logo from '/public/icons/sway-icon-logo.svg?url';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '../../ui/dialog';

export const AnnouncementPopover = () => {
  const [open, setOpen] = useState(false);
  const announcementId = 0;

  // OPEN modal if announcement with this Id has not yet been viewed
  useEffect(() => {
    // Check local storage for this announcement (if user has seen it)
    const announcement = localStorage.getItem(`announcement-${announcementId}`);
    if (!announcement) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(`announcement-${announcementId}`, 'true');
    setOpen(false);
  };

  return (
    <Dialog modal={false} open={open}>
      <DialogContent
        className="top-[15%] flex w-full bg-muted sm:w-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Announcement</DialogTitle>
        </VisuallyHidden.Root>
        <DialogClose asChild>
          <Button
            className="absolute top-[9px] right-[9px] h-[30px] w-[30px] p-0"
            onMouseDown={() => handleClose()}
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>
        <div className="flex">
          <Image alt="logo" className="pr-2" height={50} src={Logo} />
          <div className="mr-4 w-auto px-4 text-center">
            We've made minor adjustments to the interest rate curves to better
            align with the current market conditions.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
