'use client';

import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export const CopyIcon = ({ value }: { value: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <>
      <Copy
        className={cn(
          'w-4 h-4 cursor-pointer hover:text-primary-400',
          isCopied && 'hidden'
        )}
        onMouseDown={handleCopy}
      />
      <Check
        className={cn(
          'w-4 h-4 cursor-pointer hover:text-primary-400',
          !isCopied && 'hidden'
        )}
      />
    </>
  );
};
