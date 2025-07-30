'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error: _,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex h-full w-full flex-col items-center justify-center gap-y-2">
        <h2>Something went wrong!</h2>
        <Button onMouseDown={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
