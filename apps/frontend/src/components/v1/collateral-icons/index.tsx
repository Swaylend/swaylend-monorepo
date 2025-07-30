import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

export type Collateral = {
  id: string;
  name: string;
  icon: string | StaticImport;
};

type CollateralIconsProps = {
  collaterals: Collateral[];
};

export const CollateralIcons = ({ collaterals }: CollateralIconsProps) => {
  return (
    <div className="flex items-center gap-x-1">
      <div className="font-medium text-md text-white">
        {collaterals.length ?? 0}
      </div>
      <div className="flex items-center">
        {collaterals.slice(0, 3).map((collateral: Collateral) => {
          return (
            <div
              className="nth-[n+2]:ml-[-12px] flex items-center rounded-full bg-card p-1"
              key={collateral.id}
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <Image
                      alt={collateral.name}
                      className="rounded-full"
                      height={28}
                      src={collateral.icon}
                      width={28}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                  >
                    <div className="p-1">
                      <div className="font-bold">{collateral.name}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
        {collaterals.length > 3 && (
          <div
            className="nth-[n+2]:ml-[-12px] flex items-center rounded-full bg-card p-1"
            key="others"
          >
            <div className="flex h-[28px] w-[28px] items-center rounded-full bg-white/20 pl-1 font-semibold text-lavender">
              +{collaterals.length - 3}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
