import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

export type Icon = {
  id: string;
  name: string;
  path: string | StaticImport;
};

type IconPairProps = {
  icons: Icon[];
};

export const IconPair = ({ icons }: IconPairProps) => {
  return (
    <div className="flex items-center">
      {icons.map((icon: Icon) => {
        return (
          <div
            className="nth-[n+2]:ml-[-12px] flex items-center rounded-full bg-card p-1"
            key={icon.id}
          >
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                  <Image
                    alt={icon.name}
                    className="rounded-full"
                    height={64}
                    src={icon.path}
                    width={64}
                  />
                </TooltipTrigger>
                <TooltipContent
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  <div className="p-1">
                    <div className="font-bold">{icon.name}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      })}
    </div>
  );
};
