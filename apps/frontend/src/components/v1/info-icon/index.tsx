'use client';

import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
export const InfoIcon = ({ text }: { text: ReactNode }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.preventDefault()}>
          <Info className="h-4 w-4 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="max-w-[300px] font-normal">{text}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
