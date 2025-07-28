import { CheckCircleIcon } from 'lucide-react';
import { toast } from 'react-toastify';

type TransactionSuccessToastProps = {
  transactionId: string;
};

export const TransactionSuccessToast = (_: TransactionSuccessToastProps) => {
  return toast(
    <div className="flex w-full gap-x-4 h-full items-center">
      <div>
        <CheckCircleIcon className="w-8 h-8 text-primary" />
      </div>
      <div className="text-sm font-semibold flex items-center">
        <span>Transaction Successful!</span>
      </div>
    </div>,
    {
      autoClose: 1000,
    }
  );
};
