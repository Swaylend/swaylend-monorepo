'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="w-full h-full flex flex-col justify-center items-center gap-y-2">
        <h2>Something went wrongs!</h2>
        <Button onMouseDown={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
