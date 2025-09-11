import clsx from 'clsx';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import type { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

export type Point = {
  id: string;
  name: string;
  description: ReactNode;
  icon: string | StaticImport;
  displayMultiplier: string | undefined;
};

type PointIconsProps = {
  points: Point[];
  mobile?: boolean;
};

export const PointIcons = ({ points, mobile = false }: PointIconsProps) => {
  return (
    <div className="flex items-center">
      {points.map((point: Point) => {
        return (
          <div
            className="nth-[n+2]:ml-[-12px] flex items-center rounded-full bg-card p-1"
            key={point.id}
          >
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                  <div
                    className={clsx(
                      'flex items-center gap-x-2 rounded-full border-2 border-primary py-1',
                      point.displayMultiplier
                        ? 'w-[74px] bg-primary/10 pl-2'
                        : 'px-1',
                      'h-[40px] w-[40px] cursor-pointer'
                    )}
                  >
                    {point.displayMultiplier && (
                      <div className="font-semibold text-lg text-primary">
                        {point.displayMultiplier}
                      </div>
                    )}
                    <Image
                      alt={point.name}
                      className="rounded-full"
                      height={28}
                      src={point.icon}
                      width={28}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  className={mobile ? 'w-64' : 'w-fit'}
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  <div className="p-1">
                    <div className="font-bold">{point.name}</div>
                    {point.description && (
                      <div className="mt-2 text-gray-400 text-sm">
                        {point.description}
                      </div>
                    )}
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
