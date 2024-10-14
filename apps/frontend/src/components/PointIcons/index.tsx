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
  description: string;
  icon: string | StaticImport;
};

type PointIconsProps = {
  points: Point[];
};

export const PointIcons = ({ points }: PointIconsProps) => {
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
                  <Image
                    src={point.icon}
                    alt={point.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </TooltipTrigger>
                <TooltipContent
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  <div className="p-1">
                    <div className="font-bold">{point.name}</div>
                    <div className="text-sm text-gray-400">
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
