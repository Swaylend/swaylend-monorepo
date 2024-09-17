import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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
            key={icon.id}
            className="flex items-center rounded-full bg-card p-1 [&:nth-child(n+2)]:ml-[-12px]"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Image
                    src={icon.path}
                    alt={icon.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </TooltipTrigger>
                <TooltipContent>
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
