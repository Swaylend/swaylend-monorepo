import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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
      <div className="text-md text-white font-medium">
        {collaterals.length ?? 0}
      </div>
      <div className="flex items-center">
        {collaterals.slice(0, 3).map((collateral: Collateral) => {
          return (
            <div
              key={collateral.id}
              className="flex items-center rounded-full bg-card p-1 [&:nth-child(n+2)]:ml-[-12px]"
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <Image
                      src={collateral.icon}
                      alt={collateral.name}
                      width={28}
                      height={28}
                      className="rounded-full"
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
            key="others"
            className="flex items-center rounded-full bg-card p-1 [&:nth-child(n+2)]:ml-[-12px]"
          >
            <div className="w-[28px] h-[28px] text-lavender font-semibold bg-white/20 rounded-full flex items-center pl-1">
              +{collaterals.length - 3}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
