import SettingsIcon from "../../icons/Settings/SettingsIcon";
import IconButton from "@shared/src/components/common/IconButton/IconButton";
import styles from "./SlippageSetting.module.css";

type Props = {
  slippage: number;
  openSettingsModal: () => void;
};

export const SlippageSetting = ({slippage, openSettingsModal}: Props) => {
  return (
    <>
      <p className={styles.slippageLabel}>{slippage / 100}% slippage</p>
      <IconButton onClick={openSettingsModal} className={styles.settingsButton}>
        <SettingsIcon />
      </IconButton>
    </>
  );
};
