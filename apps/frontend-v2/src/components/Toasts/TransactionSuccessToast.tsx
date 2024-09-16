import { EXPLORER_URL } from '@/utils';
import { CheckCircleIcon } from 'lucide-react';
import { toast } from 'react-toastify';

type TransactionSuccessToastProps = {
  transactionId: string;
};

export const TransactionSuccessToast = ({
  transactionId,
}: TransactionSuccessToastProps) => {
  console.log(transactionId);
  return toast(
    <div className="flex w-full gap-x-4 h-full items-center">
      <div>
        <CheckCircleIcon className="w-8 h-8 text-primary" />
      </div>
      <div className=" text-sm font-semibold flex flex-col gap-y-1">
        <span>Transaction Successful!</span>
        <a
          target="_blank"
          rel="noreferrer"
          className="underline cursor-pointer font-normal text-blue-500"
          href={`${EXPLORER_URL}/${transactionId}`}
        >
          {transactionId}
        </a>
      </div>
    </div>
  );
};
