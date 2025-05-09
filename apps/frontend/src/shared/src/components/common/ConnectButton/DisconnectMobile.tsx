import {useAccount, useDisconnect, useIsConnected} from "@fuels/react";
import useFormattedAddress from "@web/src/hooks/useFormattedAddress/useFormattedAddress";
import ActionButton from "@shared/src/components/common/ActionButton/ActionButton";
import {clsx} from "clsx";
import styles from "./ConnectButton.module.css";
import {useCallback, useState, useEffect, useMemo, useRef} from "react";
import DropDownMenu from "../DropDownMenu/DropDownMenu";
import {DropDownButtons} from "@/src/utils/DropDownButtons";
import {TouchCloseIcon} from "../../icons/DropDownClose/TouchCloseIcon";
import {CloseIcon} from "../../icons/DropDownClose/CloseIcon";
import {CopyNotification} from "../../common/CopyNotification/CopyNotification";
import {openNewTab} from "@/src/utils/common";
import TransactionsHistory from "@web/src/components/common/TransactionsHistory/TransactionsHistory";
import {FuelAppUrl} from "@web/src/utils/constants";
import {useScrollLock} from "usehooks-ts";

type Props = {
  className?: string;
};

const DisconnectMobile = ({className}: Props) => {
  const {isConnected} = useIsConnected();
  const {account} = useAccount();
  const {disconnect} = useDisconnect();

  const {lock, unlock} = useScrollLock({autoLock: false});

  const [isMenuOpened, setMenuOpened] = useState(false);
  const [isHistoryOpened, setHistoryOpened] = useState(false);
  const [isAddressCopied, setAddressCopied] = useState(false);

  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpened(false);
      }
    };

    if (isMenuOpened) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpened]);

  useEffect(() => {
    if (isMenuOpened) {
      lock();
    } else {
      unlock();
    }
  }, [isMenuOpened]);

  const formattedAddress = useFormattedAddress(account);

  const handleClick = () => {
    setMenuOpened((prev) => !prev);
  };

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleCloseMenu = () => {
    setMenuOpened(false);
  };

  const handleHistoryOpen = () => {
    setHistoryOpened(true);
  };

  const handleHistoryClose = () => {
    setHistoryOpened(false);
  };

  const handleExplorerClick = () => {
    openNewTab(`${FuelAppUrl}/account/${account}/transactions`);
  };

  const handleCopy = useCallback(async () => {
    if (isConnected && account) {
      try {
        await navigator.clipboard.writeText(account);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 3000);
      } catch (error) {
        console.error("Failed to copy address: ", error);
      }
    }
  }, [account, isConnected]);

  const menuButtons = useMemo(() => {
    return DropDownButtons.map((button) => {
      return {
        ...button,
        onClick:
          button.text === "Disconnect"
            ? handleDisconnect
            : button.text === "Transaction History"
              ? handleHistoryOpen
              : button.text === "Copy Address"
                ? handleCopy
                : button.text === "View in Explorer"
                  ? handleExplorerClick
                  : button.onClick,
      };
    });
  }, [handleDisconnect, handleCopy, handleExplorerClick]);

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <ActionButton
        className={clsx(className, styles.connected)}
        onClick={handleClick}
      >
        {isConnected && <img src="/images/avatar.png" width="16" height="16" />}
        {formattedAddress}
      </ActionButton>
      {isMenuOpened && (
        <div className={styles.dropDownOverlay}>
          <DropDownMenu buttons={menuButtons} ref={menuRef}>
            <button className={styles.dropDownTouchClose}>
              <TouchCloseIcon />
            </button>
            <button className={styles.dropDownClose} onClick={handleCloseMenu}>
              <CloseIcon />
            </button>
          </DropDownMenu>
        </div>
      )}
      <TransactionsHistory
        onClose={handleHistoryClose}
        isOpened={isHistoryOpened}
      />
      {isAddressCopied && (
        <CopyNotification onClose={() => setAddressCopied(false)} />
      )}
    </>
  );
};

export default DisconnectMobile;
