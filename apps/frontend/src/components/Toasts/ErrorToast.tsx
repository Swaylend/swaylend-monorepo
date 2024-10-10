import { XCircleIcon } from 'lucide-react';
import { toast } from 'react-toastify';

type ErrorToastProps = {
  error: string;
};

export const ErrorToast = ({ error }: ErrorToastProps) => {
  console.error(error);
  const extractErrorReason = (error: string) => {
    if (error.includes('User rejected the request')) {
      return 'Transaction rejected by user.';
    }
    if (error.includes('Out of gas')) {
      return 'Transaction failed. Out of gas';
    }

    if (error.includes('not enough coins to fit the target')) {
      return 'Insufficient balance.';
    }

    if (error.includes('User rejected')) {
      return 'Transaction rejected by user.';
    }

    // if (error.includes('NotCollateralized')) {
    //   return 'Cannot withdraw more than collateralized. Try lowering the amount';
    // }

    if (error.includes('A predicate account cannot sign messages')) {
      return (
        <>
          A{' '}
          <a
            href="https://docs.fuel.network/guides/intro-to-predicates/"
            className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
            target="_blank"
            rel="noreferrer"
          >
            predicate
          </a>{' '}
          account cannot sign messages
        </>
      );
    }

    if (error.includes("don't have enough funds to cover the transaction")) {
      return 'Not enough funds to cover the transaction cost. Please acquire more ETH on this wallet.';
    }

    return error;
  };

  return toast.error(
    <div className="flex w-full gap-x-4 h-full items-center">
      <div>
        <XCircleIcon className="w-8 h-8 text-red-500" />
      </div>
      <div className="text-sm font-semibold flex flex-col gap-y-1">
        <span>Error!</span>
        <span className="font-normal">{extractErrorReason(error)}</span>
      </div>
    </div>,
    {
      progressStyle: {
        background: 'text-red-500',
      },
      autoClose:
        error === 'A predicate account cannot sign messages' ? false : 5000,
    }
  );
};
