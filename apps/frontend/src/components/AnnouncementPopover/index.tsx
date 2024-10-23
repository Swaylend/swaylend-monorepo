'use client';

import { PopoverAnchor, PopoverClose } from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Logo from '/public/icons/sway-icon-logo.svg?url';
import { Button } from '../ui/button';
import { Popover, PopoverContent } from '../ui/popover';

export const AnnouncementPopover = () => {
  const [open, setOpen] = useState(true);
  const announcementId = 0;

  // OPEN modal if announcement with this Id has not yet been viewed
  useEffect(() => {
    // Check local storage for this announcement (if user has seen it)
    const announcement = localStorage.getItem(`announcement-${announcementId}`);

    if (announcement === 'true') {
      setOpen(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(`announcement-${announcementId}`, 'true');
    setOpen(false);
  };

  return (
    <Popover defaultOpen open={open}>
      <PopoverAnchor />
      <PopoverContent
        align="center"
        className="w-auto px-[25px] max-w-[90vw] mt-16 flex bg-muted"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Image src={Logo} height={50} alt="logo" className="pr-2" />
        <div className="w-auto mr-4 px-4 text-center">
          We've made minor adjustments to the interest rate curves <br /> to
          better align with the current market conditions.
        </div>
        <PopoverClose asChild>
          <Button
            onMouseDown={() => handleClose()}
            className="absolute mt-16 w-[30px] h-[30px] right-[9px] top-[9px] p-0"
            variant="ghost"
          >
            <X className="w-5 h-5" />
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
};
