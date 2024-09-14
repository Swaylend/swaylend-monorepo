import { InfoIcon } from 'lucide-react';
import { toast } from 'react-toastify';

type InfoToastProps = {
  title: string;
  description: string;
};

export const InfoToast = ({ title, description }: InfoToastProps) => {
  return toast(
    <div className="flex w-full gap-x-4 h-full items-center">
      <div>
        <InfoIcon className="w-8 h-8 text-blue-500" />
      </div>
      <div className=" text-sm font-semibold flex flex-col gap-y-1">
        <span>{title}</span>
        <span className="font-normal ">{description}</span>
      </div>
    </div>,
    {
      progressStyle: {
        background: '#3b82f6',
      },
    }
  );
};
