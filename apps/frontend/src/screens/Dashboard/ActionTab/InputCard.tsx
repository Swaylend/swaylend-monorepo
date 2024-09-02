import Button from '@components/Button';
import useCollapse from '@components/Collapse';
import Notification from '@components/Notification';
import SizedBox from '@components/SizedBox';
import Spinner from '@components/Spinner';
import TokenInput from '@components/TokenInput/TokenInput';
import { useAccount, useIsConnected, useWallet } from '@fuels/react';
import {
  PYTH_CONTRACT_ABI,
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
} from '@pythnetwork/pyth-fuel-js';
import SummaryCard from '@screens/Dashboard/SummaryCard';
import Card from '@src/components/Card';
import { Row } from '@src/components/Flex';
import Text from '@src/components/Text';
import { EXPLORER_URL, TOKENS_BY_SYMBOL } from '@src/constants';
import { MarketAbi__factory } from '@src/contract-types/factories/MarketAbi__factory';
import { useAvailableToBorrow } from '@src/hooks/useAvailableToBorrow';
import { useBalanceOf } from '@src/hooks/useBalanceOf';
import { useCollateralConfigurations } from '@src/hooks/useCollateralConfigurations';
import { useTotalsCollateral } from '@src/hooks/useTotalsCollateral';
import { useUserCollateral } from '@src/hooks/useUserCollateral';
import { useUserSupplyBorrow } from '@src/hooks/useUserSupplyBorrow';
import { ACTION_TYPE } from '@src/stores/DashboardStore';
import BN from '@src/utils/BN';
import getAddressB256 from '@src/utils/address';
import centerEllipsis from '@src/utils/centerEllipsis';
import { currentAssetCollateralCapacityLeft } from '@src/utils/dashboardUtils';
import { errorToMessage } from '@src/utils/errorMessage';
import {
  borrowBase,
  supplyBase,
  supplyCollateral,
  withdrawBase,
  withdrawCollateral,
} from '@src/utils/marketUtils';
import { getMarketContract } from '@src/utils/readContracts';
import { walletToRead } from '@src/utils/walletToRead';
import { useStores } from '@stores';
import { Contract, type WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type IProps = any;

const InputCard: React.FC<IProps> = () => {
  const { accountStore, settingsStore, dashboardStore, notificationStore } =
    useStores();
  const { account } = useAccount();
  const { wallet: userWallet } = useWallet();
  const { isConnected } = useIsConnected();
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
  }, []);

  const marketContract = getMarketContract(
    wallet!,
    settingsStore.currentVersionConfig
  );
  const oracleContract = new Contract(
    PYTH_CONTRACT_ADDRESS_SEPOLIA,
    PYTH_CONTRACT_ABI,
    wallet!
  );

  const {
    data: collateralConfigurations,
    refetch: collateralConfigRefetch,
    isSuccess: isSuccessCollateralConfigurations,
  } = useCollateralConfigurations(marketContract);
  const {
    data: totalCollateralInfo,
    refetch: totalCollateralInfoRefetch,
    isSuccess: isSuccessTotalsCollateral,
  } = useTotalsCollateral(marketContract, dashboardStore.collaterals);
  const {
    data: maxBorrowAmount,
    refetch: maxBorrowAmountRefetch,
    isSuccess: isSuccessMaxBorrowAmount,
  } = useAvailableToBorrow(
    marketContract,
    oracleContract,
    getAddressB256(account)
  );
  const {
    data: balanceOfBaseAsset,
    refetch: balancesOfBaseAssetRefetch,
    isSuccess: isSuccessBalancesOfBaseAsset,
  } = useBalanceOf(marketContract, dashboardStore.baseToken.assetId);
  const {
    data: collateralBalances,
    refetch: collateralBalancesRefetch,
    isSuccess: isSuccessCollateralBalances,
  } = useUserCollateral(
    marketContract,
    dashboardStore.collaterals,
    getAddressB256(account)
  );
  const {
    data: userSupplyBorrow,
    refetch: userSupplyBorrowRefetch,
    isSuccess: isSuccessUserSupplyBorrow,
  } = useUserSupplyBorrow(marketContract, getAddressB256(account));

  const refetchData = () => {
    collateralConfigRefetch();
    totalCollateralInfoRefetch();
    maxBorrowAmountRefetch();
    balancesOfBaseAssetRefetch();
    collateralBalancesRefetch();
    userSupplyBorrowRefetch();
  };

  const { getCollapseProps } = useCollapse({
    isExpanded: dashboardStore.action != null,
    duration: 500,
  });
  if (!isConnected) return null;

  const handleCancelClick = () => {
    dashboardStore.setAction(null);
    dashboardStore.setTokenAmount(null);
    dashboardStore.setActionTokenAssetId(null);
    dashboardStore.setPossibleBorrowRate(null);
    dashboardStore.setPossibleSupplyRate(null);
  };

  const hideAll = () => {
    dashboardStore.setAction(null);
    dashboardStore.setActionTokenAssetId(null);
    dashboardStore.setTokenAmount(null);
  };

  const formattedTokenAmount = () => {
    if (
      dashboardStore.tokenAmount == null ||
      dashboardStore.tokenAmount?.eq(0) ||
      dashboardStore.actionTokenAssetId == null
    )
      return '0.00';
    return BN.formatUnits(
      dashboardStore.tokenAmount,
      dashboardStore.actionToken.decimals
    ).toFormat(3);
  };

  const notifyThatActionIsSuccessful = (link: string) => {
    let action = '';
    switch (dashboardStore.action) {
      case ACTION_TYPE.BORROW:
        action = 'borrowed';
        break;
      case ACTION_TYPE.REPAY:
      case ACTION_TYPE.SUPPLY:
        action = 'supplied';
        break;
      case ACTION_TYPE.WITHDRAW:
        action = 'withdrawn';
        break;
    }
    notificationStore.toast(
      `You have successfully ${action} ${formattedTokenAmount()} ${
        dashboardStore.actionToken.symbol
      }`,
      {
        link: `${EXPLORER_URL}/tx/${link}`,
        linkTitle: 'View on Explorer',
        copyTitle: `Copy tx id: ${centerEllipsis(link, 8)}`,
        copyText: link,
        type: 'success',
        title: 'Transaction is completed!',
      }
    );
  };

  const tokenInputBalance = (): string => {
    if (
      dashboardStore.actionTokenAssetId == null ||
      maxBorrowAmount == null ||
      balanceOfBaseAsset == null ||
      userSupplyBorrow == null
    )
      return '';
    if (
      dashboardStore.action === ACTION_TYPE.SUPPLY ||
      dashboardStore.action === ACTION_TYPE.REPAY
    ) {
      return (
        accountStore.getFormattedBalance(dashboardStore.actionToken) ?? '0.00'
      );
    }
    if (dashboardStore.action === ACTION_TYPE.BORROW) {
      if (maxBorrowAmount.gt(balanceOfBaseAsset)) {
        return BN.formatUnits(
          balanceOfBaseAsset ?? 0,
          dashboardStore.baseToken.decimals
        ).toFormat(2);
      }
      return BN.formatUnits(
        maxBorrowAmount ?? BN.ZERO,
        dashboardStore.baseToken.decimals
      ).toFormat(2);
    }
    if (dashboardStore.action === ACTION_TYPE.WITHDRAW) {
      if (dashboardStore.actionToken === dashboardStore.baseToken) {
        return BN.formatUnits(
          userSupplyBorrow[0] ?? BN.ZERO,
          dashboardStore.baseToken.decimals
        ).toFormat(2);
      }
      const balance =
        collateralBalances == null
          ? BN.ZERO
          : collateralBalances[dashboardStore.actionTokenAssetId];
      return BN.formatUnits(
        balance,
        dashboardStore.actionToken.decimals
      ).toFormat(2);
    }
    return '';
  };

  const tokenInputError = (): string | null => {
    if (
      // !this.initialized ||
      dashboardStore.actionTokenAssetId == null ||
      maxBorrowAmount == null ||
      !userSupplyBorrow ||
      userSupplyBorrow[1] == null ||
      balanceOfBaseAsset == null ||
      collateralBalances == null
    )
      return null;
    if (dashboardStore.tokenAmount == null || dashboardStore.tokenAmount.eq(0))
      return null;
    if (dashboardStore.action === ACTION_TYPE.SUPPLY) {
      const balance = accountStore.findBalanceByAssetId(
        dashboardStore.actionTokenAssetId
      );
      if (balance == null) return null;
      if (balance.balance?.lt(dashboardStore.tokenAmount))
        return 'Insufficient balance';
    }
    if (dashboardStore.action === ACTION_TYPE.WITHDRAW) {
      if (
        dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
      ) {
        if (dashboardStore.tokenAmount.gt(userSupplyBorrow[0] ?? BN.ZERO))
          return 'Insufficient balance';
      } else {
        const balance = collateralBalances[dashboardStore.actionTokenAssetId];
        if (dashboardStore.tokenAmount.gt(balance ?? BN.ZERO))
          return 'Insufficient balance';
      }
    }
    if (dashboardStore.action === ACTION_TYPE.BORROW) {
      if (balanceOfBaseAsset?.eq(0)) {
        return `There is no ${dashboardStore.baseToken.symbol} to borrow`;
      }
      if (dashboardStore.tokenAmount.lt(new BN(10 * 1000000))) {
        return 'Minimum borrow amount is 10 USDC';
      }
      //if reserve is less than user collateral
      if (maxBorrowAmount.gt(balanceOfBaseAsset)) {
        if (dashboardStore.tokenAmount?.gt(balanceOfBaseAsset ?? 0)) {
          const max = BN.formatUnits(
            balanceOfBaseAsset,
            dashboardStore.baseToken.decimals
          ).toFormat(2);
          return `Max to borrow is ${max} ${dashboardStore.baseToken.symbol}`;
        }
        return null;
      }
      if (dashboardStore.tokenAmount.gt(maxBorrowAmount))
        return 'You will be immediately liquidated';
    }
    if (dashboardStore.action === ACTION_TYPE.REPAY) {
      const balance = accountStore.findBalanceByAssetId(
        dashboardStore.baseToken.assetId
      );
      if (dashboardStore.tokenAmount.gt(balance?.balance ?? BN.ZERO))
        return 'Insufficient balance';
    }
    return null;
  };

  const marketAction = async () => {
    dashboardStore.setLoading(true);
    let marketContract = null;
    if (account == null) return;
    const { market } = settingsStore.currentVersionConfig;
    if (userWallet != null) {
      marketContract = MarketAbi__factory.connect(market, userWallet);
    }
    if (marketContract == null) return;
    let tx = null;
    try {
      if (dashboardStore.action === ACTION_TYPE.SUPPLY) {
        if (
          dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
        ) {
          tx = await supplyBase(marketContract, dashboardStore);
        } else {
          tx = await supplyCollateral(marketContract, dashboardStore);
        }
      }
      if (dashboardStore.action === ACTION_TYPE.WITHDRAW) {
        if (
          dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
        ) {
          tx = await withdrawBase(marketContract, dashboardStore);
        } else {
          tx = await withdrawCollateral(
            marketContract,
            dashboardStore,
            settingsStore,
            accountStore
          );
        }
      }
      if (dashboardStore.action === ACTION_TYPE.BORROW) {
        tx = await borrowBase(
          marketContract,
          dashboardStore,
          maxBorrowAmount,
          settingsStore,
          accountStore
        );
      }
      if (dashboardStore.action === ACTION_TYPE.REPAY) {
        tx = await supplyBase(marketContract, dashboardStore);
      }
      const txResult = (await toast.promise(tx.waitForResult(), {
        pending: {
          render: (
            <Row>
              <Spinner />
              <Text
                size="small"
                type="secondary"
                className="notifications-text"
                weight={500}
                style={{ marginTop: 2, width: '100%', wordBreak: 'break-word' }}
              >
                Transaction is pending...
              </Text>
            </Row>
          ),
        },
      })) as any;
      if (txResult == null) {
        notificationStore.toast('Transaction Failed', {
          type: 'error',
          title: 'Transaction Failed',
        });
      }
      if (txResult.transactionResult.isStatusSuccess)
        notifyThatActionIsSuccessful(tx.transactionId ?? '');
      else {
        notificationStore.toast('Transaction Failed', {
          type: 'error',
          title: 'Transaction Failed',
        });
      }
      hideAll();
      await accountStore.updateAccountBalances();
      refetchData();
    } catch (e) {
      const { addErrorToLog } = settingsStore;
      const err = {
        fuelAddress: account,
        address: getAddressB256(account),
        timestamp: new Date().getTime().toString(),
        action: dashboardStore.action,
        errorMessage: e?.toString() ?? '',
      };
      console.error(err);
      addErrorToLog(err);
      const error = JSON.parse(JSON.stringify(e)).toString();
      notificationStore.toast(error.error, {
        type: 'error',
        title: errorToMessage(e?.toString() ?? ''),
      });
    } finally {
      dashboardStore.setLoading(false);
    }
  };

  const marketActionMainBtnState = (): boolean => {
    //if (!this.initialized) return false;

    if (
      dashboardStore.tokenAmount == null ||
      collateralBalances == null ||
      !userSupplyBorrow ||
      userSupplyBorrow[1] == null ||
      dashboardStore.actionTokenAssetId == null
    ) {
      return false;
    }

    if (dashboardStore.action === ACTION_TYPE.SUPPLY) {
      //base
      if (
        dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
      ) {
        const balance = accountStore.findBalanceByAssetId(
          dashboardStore.baseToken.assetId
        );

        if (balance == null) return false;
        return balance.balance?.gte(dashboardStore.tokenAmount) ?? false;
      }
      //collateral

      const balance = accountStore.findBalanceByAssetId(
        dashboardStore.actionTokenAssetId
      );
      if (balance == null) return false;
      if (
        currentAssetCollateralCapacityLeft(
          dashboardStore.actionTokenAssetId,
          collateralConfigurations,
          totalCollateralInfo
        )?.eq(0)
      )
        return false;
      if (
        dashboardStore.tokenAmount.gt(
          currentAssetCollateralCapacityLeft(
            dashboardStore.actionTokenAssetId,
            collateralConfigurations,
            totalCollateralInfo
          ) ?? 0
        )
      )
        return false;
      return balance.balance?.gte(dashboardStore.tokenAmount) ?? false;
    }
    //if withdraw
    if (dashboardStore.action === ACTION_TYPE.WITHDRAW) {
      if (
        dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
      ) {
        if (userSupplyBorrow[0] == null) return false;
        return userSupplyBorrow[0].gte(dashboardStore.tokenAmount);
      }
      //collateral
      const balance = collateralBalances[dashboardStore.actionTokenAssetId];
      return dashboardStore.tokenAmount.lte(balance);
    }
    //if borrow
    if (dashboardStore.action === ACTION_TYPE.BORROW) {
      if (balanceOfBaseAsset?.eq(0)) return false;
      //if reserve is let than user collateral
      if (balanceOfBaseAsset?.lt(maxBorrowAmount ?? BN.ZERO)) {
        return dashboardStore.tokenAmount?.lte(balanceOfBaseAsset);
      }
      return true; //dashboardStore.tokenAmount.lte(maxBorrowAmount); // fixme uncomment before mainnet
    }
    //if repay
    if (dashboardStore.action === ACTION_TYPE.REPAY) {
      const balance = accountStore.findBalanceByAssetId(
        dashboardStore.baseToken.assetId
      );
      return dashboardStore.tokenAmount.lte(balance?.balance ?? BN.ZERO);
    }

    return true;
  };

  const onMaxBtnClick = () => {
    if (
      dashboardStore.actionTokenAssetId == null ||
      maxBorrowAmount == null ||
      balanceOfBaseAsset == null ||
      userSupplyBorrow == null ||
      collateralBalances == null
    )
      return null;

    switch (dashboardStore.action) {
      case ACTION_TYPE.SUPPLY: {
        const tokenBalance = accountStore.findBalanceByAssetId(
          dashboardStore.actionTokenAssetId
        );
        let balance = tokenBalance?.balance ?? BN.ZERO;
        if (
          dashboardStore.actionTokenAssetId === TOKENS_BY_SYMBOL.ETH.assetId
        ) {
          const newBalance = balance.minus(100000);
          balance = newBalance.lte(BN.ZERO) ? BN.ZERO : newBalance;
        }

        if (
          dashboardStore.actionTokenAssetId !==
            dashboardStore.baseToken.assetId &&
          tokenBalance?.balance?.gt(
            currentAssetCollateralCapacityLeft(
              dashboardStore.actionTokenAssetId,
              collateralConfigurations,
              totalCollateralInfo
            ) ?? BN.ZERO
          )
        ) {
          balance =
            currentAssetCollateralCapacityLeft(
              dashboardStore.actionTokenAssetId,
              collateralConfigurations,
              totalCollateralInfo
            ) ?? BN.ZERO;
        }
        if (
          dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
        ) {
          //balance = balance.minus(new BN(1));
        }
        if (balance.gt(BN.ZERO)) {
          dashboardStore.setTokenAmount(balance);
        }
        break;
      }
      case ACTION_TYPE.WITHDRAW:
        if (
          dashboardStore.actionTokenAssetId === dashboardStore.baseToken.assetId
        ) {
          dashboardStore.setTokenAmount(userSupplyBorrow[0] ?? BN.ZERO);
        } else {
          const balance =
            collateralBalances == null
              ? BN.ZERO
              : collateralBalances[dashboardStore.actionTokenAssetId];
          dashboardStore.setTokenAmount(balance);
        }
        break;
      case ACTION_TYPE.BORROW:
        if (maxBorrowAmount.gt(balanceOfBaseAsset)) {
          dashboardStore.setTokenAmount(balanceOfBaseAsset);
          return;
        }
        dashboardStore.setTokenAmount(maxBorrowAmount);
        break;
      case ACTION_TYPE.REPAY: {
        const balance1 = accountStore.findBalanceByAssetId(
          dashboardStore.baseToken.assetId
        );
        balance1?.balance?.gte(userSupplyBorrow[1].plus(new BN(10)))
          ? dashboardStore.setTokenAmount(userSupplyBorrow[1].plus(new BN(10)))
          : dashboardStore.setTokenAmount(balance1?.balance ?? BN.ZERO);
        break;
      }
    }
  };

  const on50BtnClick = () => {
    onMaxBtnClick();
    if (dashboardStore.tokenAmount == null || dashboardStore.tokenAmount.eq(0))
      return;
    const newTokenAmount = dashboardStore.tokenAmount.div(new BN(2));

    if (newTokenAmount.gt(0)) dashboardStore.setTokenAmount(newTokenAmount);
  };

  return (
    <div>
      <div {...getCollapseProps()}>
        <Card>
          <Text fitContent weight={600} type="secondary" size="small">
            {dashboardStore.operationName} {dashboardStore.actionToken.symbol}
          </Text>
          <SizedBox height={16} />
          <TokenInput
            disabled={dashboardStore.loading}
            decimals={dashboardStore.actionToken.decimals}
            amount={dashboardStore.tokenAmount ?? BN.ZERO}
            setAmount={dashboardStore.setTokenAmount}
            assetId={dashboardStore.actionToken.assetId}
            onMaxClick={() => onMaxBtnClick()}
            on50Click={() => on50BtnClick()}
            balance={tokenInputBalance()}
            error={tokenInputError()}
          />
          <SizedBox height={8} />
          {dashboardStore.loading ? (
            <Button disabled fixed>
              Loading...
            </Button>
          ) : (
            <Row>
              <Button kind="secondary" fixed onClick={handleCancelClick}>
                Cancel
              </Button>
              <SizedBox width={8} />
              <Button
                fixed
                onClick={marketAction} //Main function
                disabled={
                  !marketActionMainBtnState() || tokenInputError() != null
                }
              >
                {dashboardStore.operationName}
              </Button>
            </Row>
          )}
        </Card>
        {dashboardStore.notification(
          currentAssetCollateralCapacityLeft(
            dashboardStore.actionTokenAssetId,
            collateralConfigurations,
            totalCollateralInfo
          )
        ) != null && (
          <>
            <SizedBox height={16} />
            <Notification
              type="warning"
              text={
                dashboardStore.notification(
                  currentAssetCollateralCapacityLeft(
                    dashboardStore.actionTokenAssetId,
                    collateralConfigurations,
                    totalCollateralInfo
                  )
                ) ?? ''
              }
            />
          </>
        )}
      </div>
      <SizedBox height={16} />
      <SummaryCard />
    </div>
  );
};
export default observer(InputCard);
