'use client';

import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export const CopyIcon = ({ value }: { value: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <>
      <TooltipProvider delayDuration={100} skipDelayDuration={0}>
        <Tooltip open={isHover}>
          <TooltipTrigger
            onMouseDown={handleCopy}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <Copy
              className={cn(
                'w-4 h-4 cursor-pointer hover:text-primary-400',
                isCopied && 'hidden'
              )}
            />
            <Check
              className={cn(
                'w-4 h-4 cursor-pointer hover:text-primary-400',
                !isCopied && 'hidden'
              )}
            />
          </TooltipTrigger>
          <TooltipContent>
            {isCopied ? 'Copied!' : 'Copy Address'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
