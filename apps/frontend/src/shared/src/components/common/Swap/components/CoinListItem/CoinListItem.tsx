import {clsx} from "clsx";
import {BN, CoinQuantity} from "fuels";
import {memo} from "react";

import SuccessIcon from "@shared/src/components/icons/Success/SuccessIcon";
import {CoinDataWithPrice} from "@shared/src/utils/coinsConfig";
import {Tooltip} from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import styles from "./CoinListItem.module.css";
import {useAssetImage} from "@shared/src/hooks/useAssetImage";
import Image from "next/image";

type Props = {
  assetData: Omit<CoinDataWithPrice, "price"> & {
    userBalance?: CoinQuantity;
  };
};

const CoinListItem = ({assetData}: Props) => {
  const {isVerified, userBalance} = assetData;
  const balanceValue = userBalance?.amount ?? new BN(0);
  const fallbackIcon = useAssetImage(
    !assetData?.icon ? assetData.assetId : null,
  ); // fetch only if no image for the asset
  return (
    <span className={clsx(styles.coin, !assetData?.name && styles.centered)}>
      <Tooltip id="verified-tooltip" />

      <Image
        src={assetData.icon || fallbackIcon}
        alt={`${assetData.name} icon`}
        width={40}
        height={40}
        priority
      />

      <div className={styles.names}>
        <div className={styles.name_container}>
          <p className={styles.name}>{assetData.symbol}</p>
          {isVerified && (
            <span
              data-tooltip-id="verified-tooltip"
              data-tooltip-content="Verified asset from Fuel's official asset list."
            >
              <SuccessIcon />
            </span>
          )}
        </div>
        <p className={styles.fullName}>{assetData.name}</p>
      </div>
      {balanceValue.gt(0) && (
        <p className={styles.balance}>
          {balanceValue.formatUnits(assetData.decimals || 0)}
        </p>
      )}
    </span>
  );
};

export default memo(CoinListItem);
