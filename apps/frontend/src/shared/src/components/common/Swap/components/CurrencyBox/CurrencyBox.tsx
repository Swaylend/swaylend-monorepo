import {ChangeEvent, memo, useCallback} from "react";
import {clsx} from "clsx";

import Coin from "@shared/src/components/common/Coin/Coin";
import ChevronDownIcon from "@shared/src/components/icons/ChevronDown/ChevronDownIcon";

import styles from "./CurrencyBox.module.css";
import TextButton from "@shared/src/components/common/TextButton/TextButton";
import {MinEthValueBN} from "@shared/src/utils/constants";
import {B256Address, BN} from "fuels";
import useAssetMetadata from "@shared/src/hooks/useAssetMetadata";
import fiatValueFormatter from "@shared/src/utils/abbreviateNumber";
import {CurrencyBoxMode} from "@/shared/src/types/swap-types";
type Props = {
  value: string;
  assetId: B256Address | null;
  mode: CurrencyBoxMode;
  balance: BN;
  setAmount: (amount: string) => void;
  loading: boolean;
  onCoinSelectorClick: (mode: CurrencyBoxMode) => void;
  usdRate: number | null;
  previewError?: string | null;
  className?: string;
};

const CurrencyBox = ({
  value,
  assetId,
  mode,
  balance,
  setAmount,
  loading,
  onCoinSelectorClick,
  usdRate,
  previewError,
  className,
}: Props) => {
  const metadata = useAssetMetadata(assetId);
  const balanceValue = balance.formatUnits(metadata.decimals || 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(",", ".");
    const re = new RegExp(`^[0-9]*[.]?[0-9]{0,${metadata.decimals || 0}}$`);

    if (re.test(inputValue)) {
      setAmount(inputValue);
    }
  };

  const handleCoinSelectorClick = () => {
    if (!loading) {
      onCoinSelectorClick(mode);
    }
  };

  const handleMaxClick = useCallback(() => {
    let amountStringToSet;
    // TODO ETH AssetId
    if (metadata.symbol === "ETH" && mode === "sell") {
      const amountWithoutGasFee = balance.sub(MinEthValueBN);
      amountStringToSet = amountWithoutGasFee.gt(0)
        ? amountWithoutGasFee.formatUnits(metadata.decimals || 0)
        : balanceValue;
    } else {
      amountStringToSet = balanceValue;
    }

    setAmount(amountStringToSet);
  }, [assetId, mode, balance, setAmount, metadata]);

  const coinNotSelected = assetId === null;

  const numericValue = parseFloat(value);
  const usdValue =
    !isNaN(numericValue) && Boolean(usdRate)
      ? fiatValueFormatter(numericValue * usdRate!)
      : null;

  return (
    <div className={clsx(styles.currencyBox, className)}>
      <p className={styles.title}>{mode === "buy" ? "Buy" : "Sell"}</p>
      <div className={styles.content}>
        {previewError ? (
          <div className={styles.warningBox}>
            <p className={styles.warningLabel}>{previewError}</p>
          </div>
        ) : (
          <input
            className={clsx(styles.input, loading && "blurredTextLight")}
            type="text"
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0"
            minLength={1}
            value={value}
            disabled={coinNotSelected || loading}
            onChange={handleChange}
          />
        )}

        <button
          className={clsx(
            styles.selector,
            coinNotSelected && styles.selectorHighlighted,
          )}
          onClick={handleCoinSelectorClick}
          disabled={loading}
        >
          {coinNotSelected ? (
            <p className={styles.chooseCoin}>Choose coin</p>
          ) : (
            <Coin assetId={assetId} />
          )}
          <ChevronDownIcon />
        </button>
      </div>
      <div className={styles.estimateAndBalance}>
        <p className={styles.estimate}>{usdValue !== null && usdValue}</p>
        {balance.gt(0) && (
          <span className={styles.balance}>
            Balance: {balanceValue}
            &nbsp;
            <TextButton onClick={handleMaxClick}>Max</TextButton>
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(CurrencyBox);
