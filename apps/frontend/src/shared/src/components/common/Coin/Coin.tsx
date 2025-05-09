import {memo} from "react";

import styles from "./Coin.module.css";
import {clsx} from "clsx";
import ChevronDownIcon from "@shared/src/components/icons/ChevronDown/ChevronDownIcon";
import useAssetMetadata from "@shared/src/hooks/useAssetMetadata";
import {useAssetImage} from "@shared/src/hooks/useAssetImage";

type Props = {
  assetId: string | null;
  className?: string;
  onClick?: VoidFunction;
};

const Coin = ({assetId, className, onClick}: Props) => {
  const metadata = useAssetMetadata(assetId);
  const icon = useAssetImage(assetId);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const newPool = Boolean(onClick);

  return (
    <div
      className={clsx(styles.coin, newPool && styles.clickable)}
      onClick={handleClick}
    >
      {icon && <img src={icon} alt={`${metadata.symbol} icon`} />}
      <p className={clsx(styles.name, className)}>
        {metadata.symbol ?? "Choose Asset"}
      </p>
      {newPool && <ChevronDownIcon />}
    </div>
  );
};

export default Coin;
