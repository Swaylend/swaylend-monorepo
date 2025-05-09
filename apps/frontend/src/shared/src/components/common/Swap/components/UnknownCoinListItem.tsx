import useAssetMetadata from "@shared/src/hooks/useAssetMetadata";
import CoinListItem from "./CoinListItem/CoinListItem";
import {CoinQuantity} from "fuels";
import styles from "./CoinsListModal/CoinsListModal.module.css";
import SkeletonLoader from "./SkeletonLoader/SkeletonLoader";
import useAsset from "@shared/src/hooks/useAsset";

interface Props {
  assetId: string;
  balance: CoinQuantity | undefined;
  onClick: () => void;
}

export default function UnknownCoinListItem({
  assetId,
  balance,
  onClick,
}: Props) {
  const {asset: metadata, isLoading} = useAsset(assetId);

  const assetData = metadata && {
    ...metadata,
    userBalance: balance,
    isVerified: false, // setting is verified to false as the asset is imported by address
  };

  if (assetData) {
    return (
      <div className={styles.tokenListItem} onClick={onClick}>
        <CoinListItem assetData={assetData} />
      </div>
    );
  }

  if (isLoading) {
    return <SkeletonLoader isLoading={true} count={1} textLines={1} />;
  }

  return <div style={{padding: "8px 16px"}}>Asset not found</div>;
}
