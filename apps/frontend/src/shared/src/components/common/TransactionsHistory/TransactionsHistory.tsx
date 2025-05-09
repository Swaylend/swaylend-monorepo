import defaultImage from "@shared/assets/unknown-asset.svg";
import useFormattedAddress from "@shared/src/hooks/useFormattedAddress/useFormattedAddress";
import useWalletTransactions from "@shared/src/hooks/useWalletTransactions";
import {FuelAppUrl} from "@shared/src/utils/constants";
import {useAccount, useIsConnected} from "@fuels/react";
import Image from "next/image";
import {forwardRef, useMemo} from "react";
import {TransactionsCloseIcon} from "../../icons/Close/TransactionsCloseIcon";
import CopyAddressIcon from "../../icons/Copy/CopyAddressIcon";
import styles from "./TransactionsHistory.module.css";
import SkeletonLoader from "../Swap/components/SkeletonLoader/SkeletonLoader";

interface TransactionsHistoryProps {
  onClose: () => void;
  isOpened: boolean;
}

const TransactionsHistory = forwardRef<
  HTMLDivElement,
  TransactionsHistoryProps
>(function TransactionsHistory({onClose, isOpened}, ref) {
  const {account} = useAccount();
  const {isConnected} = useIsConnected();
  const formattedAddress = useFormattedAddress(account);
  const walletAddress = useMemo(() => {
    if (isConnected) {
      return formattedAddress;
    }

    return "Connect Wallet";
  }, [isConnected, formattedAddress]);

  const {transactions, isLoading} = useWalletTransactions(account, isOpened);

  const handleCopy = () => {
    if (navigator.clipboard && account) {
      navigator.clipboard.writeText(account).then(
        () => {
          console.log("Address copied to clipboard!");
        },
        (err) => {
          console.error("Failed to copy address: ", err);
        },
      );
    }
  };

  return (
    <div className={isOpened ? styles.overlayOpened : styles.overlayClosed}>
      <div
        className={`${styles.wrapper} ${isOpened ? styles.open : styles.close}`}
        ref={ref}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Transactions History</h2>
          <button
            type="button"
            className={styles.transactionCloseButton}
            onClick={onClose}
          >
            <TransactionsCloseIcon />
          </button>
        </div>
        <div className={styles.accountInfo}>
          <div className={styles.accountUserInfo}>
            <Image
              className={styles.accountAvatar}
              src="/images/avatar.png"
              priority
              alt="avatar"
              width={40}
              height={40}
            />
            <span className={styles.accountWallet}>{walletAddress}</span>
            <button
              className={styles.copyButton}
              type="button"
              onClick={handleCopy}
            >
              <CopyAddressIcon />
            </button>
          </div>
          {/*<span className={styles.accountBalance}>$4,789.06</span>*/}
        </div>
        <SkeletonLoader isLoading={isLoading} count={6} textLines={2}>
          <ul className={styles.transactionsList}>
            {Object.entries(transactions).map(([date, transactions]) => (
              <li key={date} className={styles.transactionGroup}>
                <span className={styles.transactionDate}>{date}</span>
                <ul className={styles.transactions}>
                  {transactions.map((transaction, index) => (
                    <li key={index} className={styles.transaction}>
                      <div className={styles.transactionInfo}>
                        <div className={styles.transactionCoins}>
                          <div className={styles.firstCoin}>
                            <Image
                              src={transaction.firstAsset?.icon || defaultImage}
                              alt={`${transaction.firstAsset.symbol} icon`}
                              priority
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className={styles.secondCoin}>
                            <Image
                              src={
                                transaction.secondAsset?.icon || defaultImage
                              }
                              alt={`${transaction.secondAsset.name} icon`}
                              priority
                              width={40}
                              height={40}
                            />
                          </div>
                        </div>
                        <div className={styles.transactionText}>
                          <div className={styles.transactionType}>
                            <a
                              href={`${FuelAppUrl}/tx/${transaction.tx_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className={styles.transactionName}>
                                {transaction.name}
                              </span>
                            </a>
                            <div
                              className={`${styles.typeCircle} ${
                                transaction.withdrawal
                                  ? styles.withdrawal
                                  : transaction.addLiquidity
                                    ? styles.added
                                    : ""
                              }`}
                            ></div>
                          </div>
                          <span className={styles.transactionAmount}>
                            {transaction.firstAssetAmount}{" "}
                            {transaction.firstAsset.name}
                            {transaction.addLiquidity || transaction.withdrawal
                              ? " and "
                              : " for "}
                            {transaction.secondAssetAmount}{" "}
                            {transaction.secondAsset.name}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </SkeletonLoader>
      </div>
      <div
        className={isOpened ? styles.linerVisible : styles.linerHidden}
      ></div>
    </div>
  );
});

export default TransactionsHistory;
