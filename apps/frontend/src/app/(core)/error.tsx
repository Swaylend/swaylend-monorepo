'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-y-2">
      <h2>Something went wrong!</h2>
      <Button onMouseDown={() => reset()}>Try again</Button>
    </div>
  );
}
