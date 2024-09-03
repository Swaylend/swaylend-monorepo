import { EXPLORER_URL } from '@/utils';
import { toast } from 'react-toastify';

type TransactionSuccessToastProps = {
  transactionId: string;
};

export const TransactionSuccessToast = ({
  transactionId,
}: TransactionSuccessToastProps) => {
  console.log(transactionId);
  return toast(
    <div>
      Transaction successful:{' '}
      <a
        target="_blank"
        rel="noreferrer"
        className="underline cursor-pointer text-blue-500"
        href={`${EXPLORER_URL}/${transactionId}`}
      >
        {transactionId}
      </a>
    </div>
  );
};
