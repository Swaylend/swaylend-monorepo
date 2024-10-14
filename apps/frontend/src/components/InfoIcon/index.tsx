import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
export const InfoIcon = ({ text }: { text: string }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.preventDefault()}>
          <Info className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
          <div>{text}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
