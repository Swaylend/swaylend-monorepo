import { useAccount } from '@fuels/react';
import Link from 'next/link';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '../ui/button';

export const TermsAndConditions = ({
  setActiveStep,
}: {
  setActiveStep: (step: number) => void;
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const { account } = useAccount();

  const handleAccept = () => {
    localStorage.setItem(`t&c-${account}`, 'true');
    setActiveStep(1);
  };

  const handleDecline = () => {
    // On decline redirect user to `swaylend.com`
    window.location.href = 'https://swaylend.com';
  };

  return (
    <>
      <div className="scrollbar scrollbar-thumb-primary scrollbar-track-card flex h-full w-full flex-col gap-y-2.5 overflow-auto rounded-md border border-[#666E79] px-6 py-4 text-lavender">
        <div className="text-center font-semibold text-lg text-white">
          Terms & Conditions
        </div>
        <div className="text-center text-moon">Last Updated: 01.09.2024</div>
        <div className="mt-2">
          <div className="text-lavender">
            <p>
              No representation or warranty is made concerning any aspect of the
              Swaylend Protocol, including its suitability, quality,
              availability, accessibility, accuracy or safety. As more fully
              explained in the Terms and Conditions (available below), your
              access to and use of the Swaylend Protocol through this Interface
              is entirely at your own risk and could lead to substantial losses,
              for which you take full responsibility.
            </p>
            <p>
              This Interface is not available to residents of Belarus, Burundi,
              the Central African Republic, the Democratic Republic of Congo,
              the Democratic People’s Republic of Korea, Ukraine, Cuba, Iran,
              Libya, the People’s Republic of China, the Russian Federation,
              Somalia, Sudan, South Sudan, Syria, the United States of America,
              Venezuela, Yemen, and Zimbabwe or any other jurisdiction in which
              accessing or using the Swaylend Protocol is prohibited
              (“Prohibited Jurisdictions”). In using this Interface, you confirm
              that you are not located in, incorporated or otherwise established
              in, or resident of, a Prohibited Jurisdiction.
            </p>
            <div className="mt-4 flex items-center max-md:flex-col max-md:gap-y-2 max-md:text-center md:gap-x-2">
              <div
                className="flex items-center justify-center max-md:w-full md:gap-x-2"
                onMouseDown={() => setIsChecked(!isChecked)}
              >
                <Checkbox
                  checked={isChecked}
                  className="border-lavender"
                  id="terms"
                />
                <p
                  className="cursor-pointer"
                  onMouseDown={() => setIsChecked(!isChecked)}
                >
                  I confirm that I have read, understand and accept the{' '}
                  <Link
                    className="text-primary underline"
                    href="https://swaylend.gitbook.io/swaylend-docs/legal/terms-and-condition"
                    target="_blank"
                  >
                    Terms and Conditions.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-x-2.5 px-3 pt-[30px] pb-4">
        <Button
          className="h-10 w-1/2 max-w-[173px]"
          onMouseDown={handleDecline}
          variant="secondary"
        >
          Reject
        </Button>
        <Button
          className="h-10 w-1/2 max-w-[173px]"
          disabled={!isChecked}
          onMouseDown={handleAccept}
          variant="default"
        >
          Next
        </Button>
      </div>
    </>
  );
};
