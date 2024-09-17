import { LoaderCircleIcon } from 'lucide-react';

export const PendingToast = () => (
  <div className="flex w-full gap-x-4 h-full items-center">
    <div>
      <LoaderCircleIcon className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
    <div className=" text-sm font-semibold flex flex-col gap-y-1">
      Transaction is pending...
    </div>
  </div>
);
