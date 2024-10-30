import { Checkbox } from '@/components/ui/checkbox';
import { useAccount } from '@fuels/react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '../ui/button';

export const TermsAndConditions = ({
  setActiveStep,
}: { setActiveStep: (step: number) => void }) => {
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
      <div className="flex flex-col w-full h-full px-6 py-4 gap-y-2.5 border-[1px] border-[#666E79] rounded-md text-lavender overflow-auto scrollbar scrollbar-thumb-primary scrollbar-track-card">
        <div className="text-center text-white font-semibold text-lg">
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
            <div className="flex max-md:flex-col max-md:gap-y-2 max-md:text-center md:gap-x-2 items-center mt-4">
              <div
                className="max-md:w-full flex md:gap-x-2 items-center justify-center"
                onMouseDown={() => setIsChecked(!isChecked)}
              >
                <Checkbox id="terms" checked={isChecked} />
                <p
                  onMouseDown={() => setIsChecked(!isChecked)}
                  className="cursor-pointer"
                >
                  I confirm that I have read, understand and accept the{' '}
                  <Link
                    href="https://docs.swaylend.com/legal/terms-and-condition"
                    className="underline text-primary"
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
      <div className="flex justify-center items-center gap-x-2.5 w-full pt-[30px] pb-4 px-3">
        <Button
          className="w-1/2 max-w-[173px] h-10"
          variant="secondary"
          onMouseDown={handleDecline}
        >
          Reject
        </Button>
        <Button
          className="w-1/2 max-w-[173px] h-10"
          variant="default"
          disabled={!isChecked}
          onMouseDown={handleAccept}
        >
          Next
        </Button>
      </div>
    </>
  );
};
