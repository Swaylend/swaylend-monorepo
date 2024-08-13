import Card from '@components/Card';
import Divider from '@components/Divider';
import { Row } from '@components/Flex';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import {
  PYTH_CONTRACT_ABI,
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
} from '@pythnetwork/pyth-fuel-js';
import { TOKENS_BY_ASSET_ID } from '@src/constants';
import { useAvailableToBorrow } from '@src/hooks/useAvailableToBorrow';
import { useBalanceOf } from '@src/hooks/useBalanceOf';
import { useCollateralConfigurations } from '@src/hooks/useCollateralConfigurations';
import { useCollateralUtilization } from '@src/hooks/useCollateralUtilization';
import { useMarketBasics } from '@src/hooks/useMarketBasics';
import { usePrice } from '@src/hooks/usePrice';
import { useUserCollateral } from '@src/hooks/useUserCollateral';
import { useUserSupplyBorrow } from '@src/hooks/useUserSupplyBorrow';
import { useStores } from '@src/stores';
import { ACTION_TYPE } from '@src/stores/DashboardStore';
import BN from '@src/utils/BN';
import {
  getTotalCollateralBalance,
  getTotalSuppliedBalance,
  getTrueTotalCollateralBalance,
} from '@src/utils/dashboardUtils';
import { getMarketContract, getOracleContract } from '@src/utils/readContracts';
import { initProvider, walletToRead } from '@src/utils/walletToRead';
import { Contract, type Provider, type WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

type IProps = any;

const SummaryCard: React.FC<IProps> = () => {
  const rootStore = useStores();
  const { accountStore, settingsStore, dashboardStore } = rootStore;
  const { data: priceData, getPrice } = usePrice(dashboardStore.allTokens);

  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [possibleCollateralValue, setPossibleCollateralValue] =
    useState<BN | null>(null);
  const [possibleBorrowCapacity, setPossibleBorrowCapacity] =
    useState<BN | null>(null);
  const [possibleAvailableToBorrow, setPossibleAvailableToBorrow] =
    useState<BN | null>(null);
  const [possibleLiquidationPoint, setPossibleLiquidationPoint] =
    useState<BN | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
    initProvider().then((p) => setProvider(p));
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

  const { data: maxBorrowAmount } = useAvailableToBorrow(
    marketContract,
    oracleContract,
    accountStore.addressInput?.value ?? ''
  );
  const { data: balanceOfBaseAsset } = useBalanceOf(
    marketContract,
    dashboardStore.baseToken.assetId
  );
  const { data: userSupplyBorrow } = useUserSupplyBorrow(
    marketContract,
    accountStore.addressInput?.value ?? ''
  );
  const { data: collateralBalances } = useUserCollateral(
    marketContract,
    dashboardStore.collaterals,
    accountStore.addressInput?.value ?? ''
  );
  const { data: collateralConfigurations } =
    useCollateralConfigurations(marketContract);
  const { data: marketBasics } = useMarketBasics(marketContract);

  const userCollateralUtilization = useCollateralUtilization(
    marketContract,
    getPrice,
    rootStore
  );

  const trueCollateralValue = useMemo(() => {
    return getTrueTotalCollateralBalance(
      collateralBalances,
      collateralConfigurations,
      getPrice
    );
  }, [collateralBalances, collateralConfigurations, priceData]);

  const collateralValue = useMemo(() => {
    return getTotalCollateralBalance(collateralBalances, getPrice);
  }, [collateralBalances, priceData]);

  const userLiquidationPoint = useMemo(() => {
    return collateralValue.times(userCollateralUtilization);
  }, [collateralValue, userCollateralUtilization]);

  let availableToBorrow = BN.ZERO;
  if (maxBorrowAmount?.gt(balanceOfBaseAsset!)) {
    availableToBorrow = balanceOfBaseAsset ?? BN.ZERO;
  } else {
    availableToBorrow = maxBorrowAmount ?? BN.ZERO;
  }

  const totalSuppliedBalance = useMemo(() => {
    if (userSupplyBorrow == null || collateralBalances == null) return BN.ZERO;
    return getTotalCollateralBalance(collateralBalances, getPrice).toFixed(2);
  }, [userSupplyBorrow, collateralBalances, priceData]);

  const borrowCapacity = useMemo(() => {
    if (userSupplyBorrow == null || availableToBorrow == null) return BN.ZERO;
    return BN.formatUnits(
      (userSupplyBorrow[1] ?? BN.ZERO).plus(availableToBorrow),
      dashboardStore.baseToken.decimals
    );
  }, [userSupplyBorrow, availableToBorrow]);

  const stats = [
    {
      title: 'Collateral Value',
      value: `$${totalSuppliedBalance}`,
      changeValue: possibleCollateralValue
        ? `$${possibleCollateralValue.toFixed(2)}`
        : null,
    },
    {
      title: 'Liquidation Point',
      value: `$${userLiquidationPoint.toFixed(2)}` ?? BN.ZERO,
      changeValue: possibleLiquidationPoint
        ? `$${(possibleLiquidationPoint ?? BN.ZERO).toFixed(2)}`
        : null,
    },
    {
      title: 'Borrow Capacity',
      value: `${(borrowCapacity ?? BN.ZERO).toFormat(2)} USDC`,
      changeValue: possibleBorrowCapacity
        ? `${possibleBorrowCapacity?.toFormat(2)} USDC`
        : null,
    },
    {
      title: 'Available to Borrow',
      value: `${BN.formatUnits(
        availableToBorrow ?? BN.ZERO,
        dashboardStore.baseToken.decimals
      ).toFormat(2)} USDC`,
      changeValue: possibleAvailableToBorrow
        ? `${possibleAvailableToBorrow?.toFixed(2)} USDC`
        : null,
    },
  ];

  const calcPositionSummary = async () => {
    // if (!this.initialized) return;
    if (
      dashboardStore.action == null ||
      dashboardStore.actionTokenAssetId == null ||
      dashboardStore.tokenAmount == null ||
      marketBasics == null ||
      userSupplyBorrow == null
    ) {
      setPossibleBorrowCapacity(null);
      setPossibleCollateralValue(null);
      setPossibleLiquidationPoint(null);
      setPossibleAvailableToBorrow(null);
      return;
    }
    if (!dashboardStore.tokenAmount || dashboardStore.tokenAmount.eq(0)) {
      setPossibleBorrowCapacity(null);
      setPossibleCollateralValue(null);
      setPossibleLiquidationPoint(null);
      setPossibleAvailableToBorrow(null);
      return;
    }

    const loanAmount = userSupplyBorrow[1] ?? BN.ZERO;

    if (dashboardStore.action === ACTION_TYPE.BORROW) {
      const baseTokenPrice = getPrice(dashboardStore.baseToken.assetId);
      const newLoanValue = BN.formatUnits(
        loanAmount.plus(dashboardStore.tokenAmount),
        dashboardStore.baseToken.decimals
      ).times(baseTokenPrice);

      const collateralUtilization = newLoanValue.div(
        trueCollateralValue ?? BN.ZERO
      );
      const userPositionLiquidationPoint = (collateralValue ?? BN.ZERO).times(
        collateralUtilization
      );
      setPossibleLiquidationPoint(userPositionLiquidationPoint);

      const availableToBorrowChange = BN.formatUnits(
        availableToBorrow.minus(dashboardStore.tokenAmount ?? BN.ZERO),
        dashboardStore.baseToken.decimals
      );
      if (availableToBorrowChange.lt(0)) {
        setPossibleAvailableToBorrow(BN.ZERO);
      } else {
        setPossibleAvailableToBorrow(availableToBorrowChange);
      }
    }

    if (dashboardStore.action === ACTION_TYPE.REPAY) {
      const baseTokenPrice = getPrice(dashboardStore.baseToken.assetId);
      const newLoanValue = BN.formatUnits(
        loanAmount.minus(dashboardStore.tokenAmount),
        dashboardStore.baseToken.decimals
      ).times(baseTokenPrice);

      const collateralUtilization = newLoanValue.div(
        trueCollateralValue ?? BN.ZERO
      );
      const userPositionLiquidationPoint = (collateralValue ?? BN.ZERO).times(
        collateralUtilization
      );
      setPossibleLiquidationPoint(userPositionLiquidationPoint);

      const availableToBorrowChange = BN.formatUnits(
        availableToBorrow.plus(dashboardStore.tokenAmount ?? BN.ZERO),
        dashboardStore.baseToken.decimals
      );
      if (availableToBorrowChange.lt(0)) {
        setPossibleAvailableToBorrow(BN.ZERO);
      } else {
        setPossibleAvailableToBorrow(availableToBorrowChange);
      }
    }

    if (dashboardStore.action === ACTION_TYPE.SUPPLY) {
      if (
        dashboardStore.actionTokenAssetId !==
          dashboardStore.baseToken.assetId &&
        collateralBalances &&
        collateralConfigurations
      ) {
        // Get collaterals value
        const collateralsValue = Object.entries(collateralBalances).reduce(
          (acc, [assetId, v]) => {
            const token = TOKENS_BY_ASSET_ID[assetId];
            let balance = v;
            if (assetId === dashboardStore.actionTokenAssetId) {
              balance = balance.plus(dashboardStore.tokenAmount ?? BN.ZERO);
            }
            balance = BN.formatUnits(balance, token.decimals);
            const dollBalance = getPrice(assetId).times(balance);
            return acc.plus(dollBalance);
          },
          BN.ZERO
        );

        const newBorrowCapacity = Object.entries(collateralBalances).reduce(
          (acc, [assetId, v]) => {
            const token = TOKENS_BY_ASSET_ID[assetId];
            const tokenBorrowCollateralFactor = BN.formatUnits(
              collateralConfigurations![
                assetId
              ].borrow_collateral_factor.toString(),
              18
            );
            let balance = v;
            if (assetId === dashboardStore.actionTokenAssetId) {
              balance = balance.plus(dashboardStore.tokenAmount ?? BN.ZERO);
            }
            balance = BN.formatUnits(balance, token.decimals);
            const dollBalance = getPrice(assetId)
              .times(balance)
              .times(tokenBorrowCollateralFactor);
            return acc.plus(dollBalance);
          },
          BN.ZERO
        );

        setPossibleCollateralValue(collateralsValue);
        setPossibleBorrowCapacity(newBorrowCapacity);
        const newAvailableToBorrow = newBorrowCapacity.minus(
          BN.formatUnits(
            userSupplyBorrow[1] ?? BN.ZERO,
            dashboardStore.baseToken.decimals
          )
        );
        if (newAvailableToBorrow.lt(0)) {
          setPossibleAvailableToBorrow(BN.ZERO);
        } else {
          setPossibleAvailableToBorrow(newAvailableToBorrow);
        }
      }
    }

    if (dashboardStore.action === ACTION_TYPE.WITHDRAW) {
      if (
        dashboardStore.actionTokenAssetId !==
          dashboardStore.baseToken.assetId &&
        collateralBalances &&
        collateralConfigurations
      ) {
        // Get collaterals value
        const collateralsValue = Object.entries(collateralBalances).reduce(
          (acc, [assetId, v]) => {
            const token = TOKENS_BY_ASSET_ID[assetId];
            let balance = v;
            if (assetId === dashboardStore.actionTokenAssetId) {
              balance = balance.minus(dashboardStore.tokenAmount ?? BN.ZERO);
            }
            balance = BN.formatUnits(balance, token.decimals);
            const dollBalance = getPrice(assetId).times(balance);
            return acc.plus(dollBalance);
          },
          BN.ZERO
        );

        const newBorrowCapacity = Object.entries(collateralBalances).reduce(
          (acc, [assetId, v]) => {
            const token = TOKENS_BY_ASSET_ID[assetId];
            const tokenBorrowCollateralFactor = BN.formatUnits(
              collateralConfigurations![
                assetId
              ].borrow_collateral_factor.toString(),
              18
            );
            let balance = v;
            if (assetId === dashboardStore.actionTokenAssetId) {
              balance = balance.minus(dashboardStore.tokenAmount ?? BN.ZERO);
            }
            balance = BN.formatUnits(balance, token.decimals);
            const dollBalance = getPrice(assetId)
              .times(balance)
              .times(tokenBorrowCollateralFactor);
            return acc.plus(dollBalance);
          },
          BN.ZERO
        );

        setPossibleCollateralValue(collateralsValue);
        setPossibleBorrowCapacity(newBorrowCapacity);
        const newAvailableToBorrow = newBorrowCapacity.minus(
          BN.formatUnits(
            userSupplyBorrow[1] ?? BN.ZERO,
            dashboardStore.baseToken.decimals
          )
        );
        if (newAvailableToBorrow.lt(0)) {
          setPossibleAvailableToBorrow(BN.ZERO);
        } else {
          setPossibleAvailableToBorrow(newAvailableToBorrow);
        }
      }
      return;
    }
  };

  useMemo(() => {
    calcPositionSummary();
  }, [
    dashboardStore.action,
    dashboardStore.actionTokenAssetId,
    dashboardStore.tokenAmount,
    // priceData
    // marketBasics,
    // userSupplyBorrow,
    // collateralBalances,
    // collateralConfigurations,
    // trueCollateralValue,
    // collateralValue,
    // userCollateralUtilization,
  ]);

  return (
    <Card>
      <Text weight={600} type="secondary" size="small">
        Position summary
      </Text>
      <SizedBox height={16} />
      <Divider />
      <SizedBox height={12} />
      {stats.map(({ value, title, changeValue }, index) => (
        <Row key={index} style={{ marginBottom: 12 }}>
          <Text weight={600}>{title}</Text>
          {value == null ? (
            <Skeleton height={24} width={100} />
          ) : (
            <>
              {changeValue != null ? (
                <Text
                  textAlign="right"
                  style={{ color: '#00b493' }}
                  weight={600}
                >
                  {changeValue}
                </Text>
              ) : (
                <Text textAlign="right" weight={600}>
                  {value}
                </Text>
              )}
            </>
          )}
        </Row>
      ))}
    </Card>
  );
};
export default observer(SummaryCard);
