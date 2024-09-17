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
                Welcome to SwayLend, the first Lending Protocol built on the
                Fuel network. By accessing or using our platform (the
                "Platform"), you agree to comply with and be bound by the
                following terms and conditions (the "Terms"). If you do not
                agree to these Terms, you should not use the Platform.
              </p>
              <h2 className="font-bold">1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, or using the Platform, you acknowledge
                that you have read, understood, and agree to be bound by these
                Terms and any other applicable laws and regulations. SwayLend
                reserves the right to modify these Terms at any time. Changes
                will be effective immediately upon posting.
              </p>
              <h2 className="font-bold">2. Eligibility</h2>
              <p>
                To use the Platform, you must be at least 18 years old and
                capable of forming legally binding contracts under applicable
                law.
              </p>
              <h2 className="font-bold">3. Platform Services</h2>
              <p>
                SwayLend offers a decentralized lending protocol, allowing users
                to deposit and borrow digital assets. You are responsible for
                understanding how decentralized finance (DeFi) works, including
                its risks, and ensuring compliance with any applicable
                regulations.
              </p>
              <h2 className="font-bold">4. User Accounts</h2>
              <p>
                You may be required to create an account to access certain
                features of the Platform. You are responsible for maintaining
                the confidentiality of your account and all activities under it.
                SwayLend is not responsible for unauthorized access or activity
                related to your account.
              </p>
              <h2 className="font-bold">5. No Financial Advice</h2>
              <p>
                All information provided by SwayLend is for informational
                purposes only and should not be considered financial advice. You
                should consult with a financial advisor before making any
                lending or borrowing decisions.
              </p>
              <h2 className="font-bold">6. Risk Acknowledgement</h2>
              <p>
                Using DeFi products involves significant risks, including but
                not limited to the risk of loss due to market volatility,
                liquidity issues, smart contract bugs, and other unforeseen
                circumstances. You acknowledge that you use the Platform at your
                own risk, and SwayLend is not responsible for any losses you may
                incur.
              </p>
              <h2 className="font-bold">7. Fees</h2>
              <p>
                SwayLend reserves the right to charge fees for certain services
                or transactions on the Platform. Any applicable fees will be
                clearly indicated, and you agree to pay these fees as part of
                using the Platform.
              </p>
              <h2 className="font-bold">8. Privacy</h2>
              <p>
                Your use of the Platform is subject to our Privacy Policy, which
                describes how we collect, use, and share your personal
                information.
              </p>
              <h2 className="font-bold">9. Intellectual Property</h2>
              <p>
                All content on the Platform, including text, graphics, logos,
                and software, is the property of SwayLend or its licensors. You
                may not use any part of the Platform's content without prior
                written consent.
              </p>
              <h2 className="font-bold">10. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, SwayLend and its
                affiliates will not be liable for any damages or losses arising
                from your use of the Platform, including but not limited to
                direct, indirect, incidental, or consequential damages.
              </p>
              <h2 className="font-bold">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold SwayLend and its affiliates
                harmless from any claims, damages, or losses resulting from your
                use of the Platform or violation of these Terms.
              </p>
              <h2 className="font-bold">12. Termination</h2>
              <p>
                SwayLend reserves the right to terminate or suspend your access
                to the Platform at any time for any reason, without prior
                notice.
              </p>
              <h2 className="font-bold">13. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the
                laws of [Jurisdiction]. Any legal actions related to these Terms
                must be brought in the courts of [Jurisdiction].
              </p>
              <h2 className="font-bold">14. Contact Information</h2>
              <p>
                If you have any questions or concerns about these Terms, please
                contact us at [email].
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
