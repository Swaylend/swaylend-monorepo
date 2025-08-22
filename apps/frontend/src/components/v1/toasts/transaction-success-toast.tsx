import { CheckCircleIcon } from 'lucide-react';
import { toast } from 'react-toastify';

type TransactionSuccessToastProps = {
  transactionId: string;
};

export const TransactionSuccessToast = (_: TransactionSuccessToastProps) => {
  return toast(
    <div className="flex h-full w-full items-center gap-x-4">
      <div>
        <CheckCircleIcon className="h-8 w-8 text-primary" />
      </div>
      <div className="flex items-center font-semibold text-sm">
        <span>Transaction Successful!</span>
      </div>
    </div>,
    {
      autoClose: 1000,
    }
  );
};
