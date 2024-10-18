import clsx from 'clsx';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export type Point = {
  id: string;
  name: string;
  description: any;
  icon: string | StaticImport;
};

type PointIconsProps = {
  points: Point[];
  value?: string;
};

export const PointIcons = ({ points, value }: PointIconsProps) => {
  return (
    <div className="flex items-center">
      {points.map((point: Point) => {
        return (
          <div
            key={point.id}
            className="flex items-center rounded-full bg-card p-1 [&:nth-child(n+2)]:ml-[-12px]"
          >
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                  <div
                    className={clsx(
                      'border-2 border-primary py-1 rounded-full flex items-center gap-x-2',
                      value ? 'bg-primary/10 pl-2 w-[74px]' : 'px-1'
                    )}
                  >
                    {value && (
                      <div className="text-lg text-primary font-semibold">
                        {value}
                      </div>
                    )}
                    <Image
                      src={point.icon}
                      alt={point.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  <div className="p-1">
                    <div className="font-bold">{point.name}</div>
                    <div className="text-sm mt-2 text-gray-400">
                      {point.description}
                    </div>
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
