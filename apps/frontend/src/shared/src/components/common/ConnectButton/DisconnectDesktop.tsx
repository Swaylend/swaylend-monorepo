import {useAccount, useDisconnect, useIsConnected} from "@fuels/react";
import {clsx} from "clsx";

import useFormattedAddress from "@shared/src/hooks/useFormattedAddress/useFormattedAddress";
import ActionButton from "@shared/src/components/common/ActionButton/ActionButton";

import styles from "./ConnectButton.module.css";
import {memo} from "react";

type Props = {
  className?: string;
};

const DisconnectDesktop = ({className}: Props) => {
  const {isConnected} = useIsConnected();
  const {account} = useAccount();
  const {disconnect} = useDisconnect();

  const formattedAddress = useFormattedAddress(account);

  if (!isConnected) {
    return null;
  }

  return (
    <ActionButton
      className={clsx(className, styles.connected)}
      onClick={disconnect}
    >
      {isConnected && <img src="/images/avatar.png" width="24" height="24" />}
      {formattedAddress}
      {isConnected && (
        <span className={styles.disconnectLabel}>Disconnect</span>
      )}
    </ActionButton>
  );
};

export default memo(DisconnectDesktop);
