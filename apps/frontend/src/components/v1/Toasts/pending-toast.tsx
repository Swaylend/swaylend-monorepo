import { LoaderCircleIcon } from 'lucide-react';

export const PendingToast = () => (
  <div className="flex h-full w-full items-center gap-x-4">
    <div>
      <LoaderCircleIcon className="h-8 w-8 animate-spin text-blue-500" />
    </div>
    <div className="flex flex-col gap-y-1 font-semibold text-sm">
      Transaction is pending...
    </div>
  </div>
);
