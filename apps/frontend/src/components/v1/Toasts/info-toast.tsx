import { InfoIcon } from 'lucide-react';
import { toast } from 'react-toastify';

type InfoToastProps = {
  title: string;
  description: string;
};

export const InfoToast = ({ title, description }: InfoToastProps) => {
  return toast(
    <div className="flex h-full w-full items-center gap-x-4">
      <div>
        <InfoIcon className="h-8 w-8 text-blue-500" />
      </div>
      <div className="flex flex-col gap-y-1 font-semibold text-sm">
        <span>{title}</span>
        <span className="font-normal">{description}</span>
      </div>
    </div>,
    {
      progressStyle: {
        background: '#3b82f6',
      },
    }
  );
};
