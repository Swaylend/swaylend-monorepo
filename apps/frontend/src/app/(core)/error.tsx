'use client';

import { Button } from '@/components/ui/button';

// biome-ignore lint/suspicious/noShadowRestrictedNames: <NextJS Error Component>
export default function Error({
  error: _,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
      <h2>Something went wrong!</h2>
      <Button onMouseDown={() => reset()}>Try again</Button>
    </div>
  );
}
