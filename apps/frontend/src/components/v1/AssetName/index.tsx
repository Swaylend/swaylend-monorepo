import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

type AssetNameProps = {
  src: StaticImport | string;
  symbol: string;
  name: string;
};

export const AssetName = ({ src, symbol, name }: AssetNameProps) => {
  return (
    <div className="flex gap-x-2 items-center">
      <div>
        <Image
          src={src}
          alt={symbol}
          width={32}
          height={32}
          className={'rounded-full'}
        />
      </div>
      <div className="font-medium text-white">{name}</div>
      <div>{symbol}</div>
    </div>
  );
};
