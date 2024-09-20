'use client';

import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

export const TermsAndConditions = () => {
  const [open, setOpen] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('termsAndConditions', 'true');
    setOpen(false);
  };

  const handleDecline = () => {
    // On decline redirect user to `swaylend.com`
    window.location.href = 'https://swaylend.com';
  };

  useEffect(() => {
    // Check local storage for terms and conditions (if user has accepted them)
    const termsAndConditions = localStorage.getItem('termsAndConditions');

    if (!termsAndConditions) {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 h-[80%] max-h-[80%] max-md:w-[90%] max-sm:rounded-xl max-w-[800px] overflow-hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="w-full overflow-hidden relative">
            <div
              className={cn(
                '-z-10 w-[90%] top-[62px] h-2 bg-gradient-to-r from-popover via-primary to-popover absolute left-[calc(5%)]'
              )}
            />
            <div
              className={cn(
                '-z-10 absolute blur-2xl top-[61px] left-[calc(33%)] rounded-full w-[33%] h-8 bg-primary'
              )}
            />
            <div className="w-full text-lg h-16 flex items-center justify-center">
              <h1 className="text-lavender font-semibold text-lg">
                Terms & Conditions
              </h1>
            </div>
          </div>
          <div className="text-center py-[30px] text-moon">
            Last Updated: 01.09.2024
          </div>
          <div className="flex-1 w-full h-full bg-popover px-[15px] sm:px-6 z-10 overflow-auto">
            <div className="flex flex-col w-full h-full px-6 py-4 gap-y-2.5 border-[1px] border-[#666E79] rounded-md overflow-auto text-lavender">
              <p>
                No representation or warranty is made concerning any aspect of
                the SwayLend Protocol, including its suitability, quality,
                availability, accessibility, accuracy or safety. As more fully
                explained in the Terms and Conditions (available below), your
                access to and use of the SwayLend Protocol through this
                Interface is entirely at your own risk and could lead to
                substantial losses, for which you take full responsibility.
              </p>
              <p>
                This Interface is not available to residents of Belarus,
                Burundi, the Central African Republic, the Democratic Republic
                of Congo, the Democratic People’s Republic of Korea, the
                temporarily occupied regions of Ukraine, Cuba, Iran, Libya, the
                People’s Republic of China, the Russian Federation, Somalia,
                Sudan, South Sudan, Syria, the United States of America,
                Venezuela, Yemen, and Zimbabwe or any other jurisdiction in
                which accessing or using the SwayLend Protocol is prohibited
                (“Prohibited Jurisdictions”). In using this Interface, you
                confirm that you are not located in, incorporated or otherwise
                established in, or resident of, a Prohibited Jurisdiction.
              </p>
              <p>
                I confirm that I have read, understand and accept the{' '}
                {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
                <a href="#" className="underline text-primary">
                  Terms and Conditions
                </a>
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-x-2.5 w-full pt-[30px] pb-4 px-3">
            <Button
              className="w-1/2 max-w-[173px] h-10"
              variant="secondary"
              onMouseDown={handleDecline}
            >
              Decline
            </Button>
            <Button
              className="w-1/2 max-w-[173px] h-10"
              variant="default"
              onMouseDown={handleAccept}
            >
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
