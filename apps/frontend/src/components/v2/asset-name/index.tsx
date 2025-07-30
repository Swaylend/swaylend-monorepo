import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

type AssetNameProps = {
  src: StaticImport | string;
  symbol: string;
  name: string;
};

export const AssetName = ({ src, symbol, name }: AssetNameProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <div>
        <Image
          alt={symbol}
          className="min-h-[32px] min-w-[32px] rounded-full"
          height={32}
          src={src}
          width={32}
        />
      </div>
      <div className="font-medium text-white">{name}</div>
      <div>{symbol}</div>
    </div>
  );
};
