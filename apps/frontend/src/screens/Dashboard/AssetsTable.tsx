import SizedBox from '@components/SizedBox';
import SymbolImage from '@components/Symbol';
import Text from '@components/Text';
import TokenIcon from '@components/TokenIcon';
import Tooltip from '@components/Tooltip';
import styled from '@emotion/styled';
import { useAccount, useBalance, useIsConnected } from '@fuels/react';
import TokenInfo from '@screens/Dashboard/TokenInfo';
import attention from '@src/assets/icons/attention.svg';
import { Column, Row } from '@src/components/Flex';
import { useCollateralConfigurations } from '@src/hooks/useCollateralConfigurations';
import { usePrice } from '@src/hooks/usePrice';
import { useTotalsCollateral } from '@src/hooks/useTotalsCollateral';
import { useUserCollateral } from '@src/hooks/useUserCollateral';
import { ACTION_TYPE } from '@src/stores/DashboardStore';
import BN from '@src/utils/BN';
import getAddressB256 from '@src/utils/address';
import { getMarketContract } from '@src/utils/readContracts';
import { walletToRead } from '@src/utils/walletToRead';
import { useStores } from '@stores';
import type { WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

type IProps = any;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const TokenRow = styled.div<{ selected?: boolean }>`
  display: grid;
  grid-template-columns: 6fr 6fr 4fr;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;

  background: ${({ theme }) => theme.colors.dashboard.tokenRowColor};
  border-radius: 4px;
  margin-bottom: 2px;

  :hover {
    cursor: pointer;
    background: ${({ theme }) => theme.colors.dashboard.tokenRowSelected};
  }
`;
const Header = styled.div`
  display: grid;
  grid-template-columns: 6fr 6fr 4fr;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 2px;
  background: ${({ theme }) => theme.colors.dashboard.tokenRowColor};
`;

const TokenRowSkeleton = () => (
  <TokenRow>
    <Row>
      <Skeleton width={40} height={40} style={{ borderRadius: 50 }} />
      <SizedBox width={20} />
      <Column>
        <Skeleton height={24} width={100} />
        <Skeleton height={16} width={100} />
      </Column>
    </Row>
    <div />
    <Skeleton height={16} width={100} />
  </TokenRow>
);
const AssetsTable: React.FC<IProps> = () => {
  const { accountStore, settingsStore, dashboardStore } = useStores();
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);
  const { account } = useAccount();
  const { isConnected } = useIsConnected();

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
  }, []);

  const marketContract = getMarketContract(
    wallet!,
    settingsStore.currentVersionConfig
  );

  const { data: collateralBalances, isLoading } = useUserCollateral(
    marketContract,
    dashboardStore.collaterals,
    getAddressB256(account)
  );
  const { data: collateralConfigurations } =
    useCollateralConfigurations(marketContract);
  const { data: totalCollateralInfo } = useTotalsCollateral(
    marketContract,
    dashboardStore.collaterals
  );

  const handleAssetClick = (action: ACTION_TYPE, assetId: string) => {
    dashboardStore.setTokenAmount(null);
    dashboardStore.setAction(action);
    dashboardStore.setMode(0);
    dashboardStore.setActionTokenAssetId(assetId);
  };
  return (
    <Root>
      <Header>
        <Text size="small" type="secondary">
          Collateral asset
        </Text>
        <Text />
        <Text size="small" type="secondary">
          Protocol balance
        </Text>
      </Header>
      {dashboardStore.collaterals.map((token) => {
        if (isLoading) return <TokenRowSkeleton key={token.assetId} />;

        const supplyCap =
          collateralConfigurations == null
            ? BN.ZERO
            : new BN(
                collateralConfigurations[token.assetId].supply_cap.toString()
              );
        const collateralReserve =
          totalCollateralInfo == null
            ? BN.ZERO
            : totalCollateralInfo[token.assetId];
        // const { balance: userBalance } = useBalance({address: account, assetId: token.assetId});
        const userBalance = accountStore.getBalance(token);
        const walletBalance = accountStore.getFormattedBalance(token);
        const protocolBalance =
          collateralBalances != null
            ? collateralBalances[token.assetId]
            : BN.ZERO;
        const canWithdraw = protocolBalance.gt(0);
        const protocolBalanceFormatted = BN.formatUnits(
          protocolBalance,
          token.decimals
        ).toFormat(4);
        const collateralCapacityLeft = supplyCap.minus(collateralReserve);
        const canSupply = userBalance?.gt(0);
        return (
          <TokenRow key={token.assetId}>
            <Tooltip content={<TokenInfo assetId={token.assetId} />}>
              <Row alignItems="center">
                <TokenIcon size="small" src={token.logo} />
                <SizedBox width={20} />
                <Column>
                  <Row alignItems="center">
                    <Text weight={600} fitContent>
                      {token.name}
                    </Text>
                    <SizedBox width={4} />
                    {account != null &&
                      collateralBalances != null &&
                      collateralCapacityLeft.eq(0) && (
                        <img alt="att" src={attention} />
                      )}
                  </Row>
                  <Text size="small" weight={600} type="secondary">
                    {isConnected
                      ? `${token.symbol} • ${walletBalance} in wallet`
                      : `${token.symbol}`}
                  </Text>
                </Column>
              </Row>
            </Tooltip>
            <div />
            <Row justifyContent="flex-end" alignItems="center">
              <Text type="secondary" size="small" fitContent>
                {protocolBalanceFormatted}
              </Text>
              <SizedBox width={24} />
              <SymbolImage
                type="plus"
                disabled={!canSupply}
                onClick={() =>
                  canSupply &&
                  handleAssetClick(ACTION_TYPE.SUPPLY, token.assetId)
                }
              />
              <SizedBox width={8} />
              <SymbolImage
                type="minus"
                disabled={!canWithdraw}
                onClick={() =>
                  canWithdraw &&
                  handleAssetClick(ACTION_TYPE.WITHDRAW, token.assetId)
                }
              />
            </Row>
          </TokenRow>
        );
      })}
    </Root>
  );
};
export default observer(AssetsTable);
