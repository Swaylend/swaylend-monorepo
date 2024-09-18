import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';
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
        {collaterals.map((collateral: Collateral) => {
          return (
            <div
              key={collateral.id}
              className="flex items-center rounded-full bg-card p-1 [&:nth-child(n+2)]:ml-[-12px]"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Image
                      src={collateral.icon}
                      alt={collateral.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-1">
                      <div className="font-bold">{collateral.name}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
};
