import Image from 'next/image';
import Banner from '/public/banner.png';
import { Button } from '../../ui/button';

export const GeneralInfo = ({
  setOpen,
}: {
  setOpen: (val: boolean) => void;
}) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="scrollbar scrollbar-thumb-primary scrollbar-track-card flex h-full w-full flex-col justify-between gap-y-2.5 overflow-auto rounded-md px-6 py-4 text-lavender">
        <div>
          <div className="text-center font-semibold text-white text-xl">
            Before you Enter
          </div>

          <div className="mt-4 w-full">
            <Image alt="a" height={500} src={Banner} width={1500} />
          </div>
          <div className="mt-8 text-lg">
            <div className="mt-4">
              While we are excited for the world to experience the first ever
              lending protocol on Fuel Network, we wanted to add some very
              important reminders. Swaylend is a new and experimental
              technology. As with all new protocols, especially in DeFi, this
              technology should be used with caution and at your own discretion.
              <br />
              <br />
              We understand and acknowledge the importance of security. We have
              employed measures such as comprehensive quality testing and
              external audits to identify and rectify any issues.
              <br />
              <br />
              Swaylend engaged with one audit firm,{' '}
              <a
                className="text-primary underline"
                href="https://www.halborn.com/"
                rel="noreferrer"
                target="_blank"
              >
                Halborn
              </a>
              , for smart contract review. To learn more about the audit reports
              and risks involved with using Swaylend, please visit the{' '}
              <a
                className="text-primary underline"
                href="https://swaylend.gitbook.io/swaylend-docs/"
                rel="noreferrer"
                target="_blank"
              >
                official documentation
              </a>
              . Swaylend was built by Reserve Labs, a web3 venture studio.
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-end px-6 py-4">
        <Button onClick={handleClose}>Explore Swaylend</Button>
      </div>
    </>
  );
};
