import { toast } from 'react-toastify';

type ErrorToastProps = {
  error: string;
};

export const ErrorToast = ({ error }: ErrorToastProps) => {
  console.error(error);
  const extractErrorReason = (error: string) => {
    if (error.includes('Out of gas')) {
      return 'Transaction failed. Out of gas';
    }

    if (error === 'not enough coins to fit the target') {
      return 'Insufficient balance.';
    }

    if (error.includes('transaction reverted')) {
      return 'Transaction reverted.';
    }

    return error;
  };

  return toast.error(extractErrorReason(error));
};
