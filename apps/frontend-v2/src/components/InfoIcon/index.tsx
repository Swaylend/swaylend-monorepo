import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import React from 'react';
export const InfoIcon = ({ text }: { text: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent>
          <div>{text}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
