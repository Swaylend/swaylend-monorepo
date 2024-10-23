'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Logo from '/public/icons/sway-icon-logo.svg?url';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent } from '../ui/dialog';

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
    <Dialog open={open} modal={false}>
      <DialogContent
        className="w-full sm:w-auto flex bg-muted top-[15%]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogClose asChild>
          <Button
            onMouseDown={() => handleClose()}
            className="absolute w-[30px] h-[30px] p-0 right-[9px] top-[9px]"
            variant="ghost"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogClose>
        <div className="flex">
          <Image src={Logo} height={50} alt="logo" className="pr-2" />
          <div className="w-auto mr-4 px-4 text-center">
            We've made minor adjustments to the interest rate curves to better
            align with the current market conditions.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
