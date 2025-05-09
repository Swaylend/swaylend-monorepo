import {memo, useState} from "react";
import ExchangeIcon from "@shared/src/components/icons/Exchange/ExchangeIcon";
import useExchangeRate from "@shared/src/hooks/useExchangeRate/useExchangeRate";

import styles from "./ExchangeRate.module.css";
import {CurrencyBoxMode, SwapState} from "@/shared/src/types/swap-types";

type Props = {
  swapState: SwapState;
};

const ExchangeRate = ({swapState}: Props) => {
  const [mode, setMode] = useState<CurrencyBoxMode>("sell");

  const handleClick = () => {
    setMode((prevMode) => (prevMode === "sell" ? "buy" : "sell"));
  };

  const rate = useExchangeRate(swapState, mode);

  if (!rate) {
    return null;
  }

  return (
    <button className={styles.exchangeRate} onClick={handleClick}>
      {rate}
      <ExchangeIcon />
    </button>
  );
};

export default memo(ExchangeRate);
