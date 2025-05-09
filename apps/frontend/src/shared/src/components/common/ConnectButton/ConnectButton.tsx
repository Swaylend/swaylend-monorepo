"use client";

import {clsx} from "clsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import styles from "./ConnectButton.module.css";

import ActionButton from "@shared/src/components/common/ActionButton/ActionButton";
import TransactionsHistory from "@shared/src/components/common/TransactionsHistory/TransactionsHistory";
import useFormattedAddress from "@shared/src/hooks/useFormattedAddress/useFormattedAddress";
import useWeb3React from "@shared/src/hooks/useWeb3Connection";
import {openNewTab} from "@shared/src/utils/common";
import {FuelAppUrl} from "@shared/src/utils/constants";
import {DropDownButtons} from "@shared/src/utils/DropDownButtons";
import {useScrollLock} from "usehooks-ts";
import {CopyNotification} from "../../common/CopyNotification/CopyNotification";
import {ArrowDownIcon} from "../../icons/ArrowDown/ArrowDownIcon";
import {ArrowUpIcon} from "../../icons/ArrowUp/ArrowUpIcon";
import DropDownMenu from "../DropDownMenu/DropDownMenu";

type Props = {
  className?: string;
  isWidget?: boolean;
};

const ConnectButton = ({className, isWidget}: Props) => {
  const {account, connect, disconnect, isConnected, isWalletLoading} =
    useWeb3React();

  const {lock, unlock} = useScrollLock({autoLock: false});

  // TODO: Hack to avoid empty button when account is changed to the not connected one in wallet
  // It is not reproducible on Fuelet, but on Fuel wallet
  // isConnected remains `true` while account is `null` which is not correct
  // Consider creating an issue in Fuel repo
  // useEffect(() => {
  //   if (isConnected && !account) {
  //     disconnect();
  //   }
  // }, [account, isConnected]);

  const [isMenuOpened, setMenuOpened] = useState(false);
  const [isHistoryOpened, setHistoryOpened] = useState(false);
  const [isAddressCopied, setAddressCopied] = useState(false);

  const menuRef = useRef<HTMLUListElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // TODO: Ugly, rewrite all modals/dropdowns/notifications/sidenavs to the separate logic layer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef?.current?.contains(event.target as Node)
      ) {
        setMenuOpened(false);
      }
    };

    const handleClickOutsideTransactions = (event: MouseEvent) => {
      if (
        transactionsRef.current &&
        !transactionsRef.current.contains(event.target as Node)
      ) {
        setHistoryOpened(false);
      }
    };

    if (isMenuOpened) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    if (isHistoryOpened) {
      document.addEventListener("mousedown", handleClickOutsideTransactions);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideTransactions);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutsideTransactions);
    };
  }, [isMenuOpened, isHistoryOpened]);

  const handleConnection = useCallback(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setMenuOpened(false);
  }, [disconnect]);

  const handleClick = useCallback(() => {
    if (!isConnected) {
      handleConnection();
    } else {
      setMenuOpened((prev) => !prev);
    }
  }, [isConnected, handleConnection]);

  const formattedAddress = useFormattedAddress(account);

  const title = useMemo(() => {
    if (isConnected) {
      return formattedAddress;
    }

    return "Connect Wallet";
  }, [isConnected, formattedAddress]);

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

  const handleExplorerClick = () => {
    openNewTab(`${FuelAppUrl}/account/${account}/transactions`);
  };

  const handleHistoryOpen = () => {
    setHistoryOpened(true);
    setMenuOpened(false);
  };

  const handleHistoryClose = () => {
    setHistoryOpened(false);
  };

  const getOnClickHandler = useCallback(
    (text: string) => {
      switch (text) {
        case "Disconnect":
          return handleDisconnect;
        case "Transaction History":
          return handleHistoryOpen;
        case "Copy Address":
          return handleCopy;
        case "View in Explorer":
          return handleExplorerClick;
        default:
          return () => {};
      }
    },
    [handleCopy, handleDisconnect, handleExplorerClick],
  );

  const filterButtons = useCallback(
    (button: {text: string}) => {
      return (
        !isWidget ||
        button.text === "Disconnect" ||
        button.text === "Copy Address"
      );
    },
    [isWidget],
  );

  const menuButtons = useMemo(() => {
    return DropDownButtons.filter(filterButtons).map((button) => ({
      ...button,
      onClick: getOnClickHandler(button.text),
    }));
  }, [filterButtons, getOnClickHandler]);

  useEffect(() => {
    if (isHistoryOpened) {
      lock();
    } else {
      unlock();
    }
  }, [isHistoryOpened]);

  return (
    <>
      <div style={{position: "relative"}}>
        <ActionButton
          className={clsx(className, isConnected && styles.connected)}
          onClick={handleClick}
          loading={isWalletLoading}
          ref={buttonRef}
        >
          {isConnected && (
            <img src="/images/avatar.png" width="24" height="24" />
          )}
          {title}
          {isConnected && (!isMenuOpened ? <ArrowDownIcon /> : <ArrowUpIcon />)}
        </ActionButton>
        {isMenuOpened && <DropDownMenu buttons={menuButtons} ref={menuRef} />}
        <TransactionsHistory
          onClose={handleHistoryClose}
          isOpened={isHistoryOpened}
          ref={transactionsRef}
        />
      </div>
      {isAddressCopied && (
        <CopyNotification onClose={() => setAddressCopied(false)} />
      )}
    </>
  );
};

export default ConnectButton;
