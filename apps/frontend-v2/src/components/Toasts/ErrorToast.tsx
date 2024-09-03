import { toast } from 'react-toastify';

type ErrorToastProps = {
  error: string;
};

export const ErrorToast = ({ error }: ErrorToastProps) => {
  const extractErrorReason = (error: string) => {
    if (error.includes('Out of gas')) {
      return 'Transaction failed. Out of gas';
    }

    return '';
  };

  return toast.error(extractErrorReason(error));
};
