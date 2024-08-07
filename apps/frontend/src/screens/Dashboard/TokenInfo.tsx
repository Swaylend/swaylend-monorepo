import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { Column, Row } from '@src/components/Flex';
import { TOKENS_BY_ASSET_ID } from '@src/constants';
import { useCollateralConfigurations } from '@src/hooks/useCollateralConfigurations';
import { usePrice } from '@src/hooks/usePrice';
import { useTotalsCollateral } from '@src/hooks/useTotalsCollateral';
import BN from '@src/utils/BN';
import { getMarketContract } from '@src/utils/readContracts';
import { walletToRead } from '@src/utils/walletToRead';
import { useStores } from '@stores';
import type { WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useState } from 'react';

interface IProps {
  assetId: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.tokenTooltip.background};
  padding: 16px;
  width: 300px;
  box-sizing: border-box;
`;
const Container = styled(Column)`
  & > * {
    margin-bottom: 12px;
  }
`;

const TokenInfo: React.FC<IProps> = ({ assetId }) => {
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
  }, []);
  const { accountStore, dashboardStore, settingsStore } = useStores();

  const { getFormattedPrice: getFormattedTokenPrice } = usePrice(
    dashboardStore.allTokens
  );

  const marketContract = getMarketContract(
    wallet!,
    settingsStore.currentVersionConfig
  );

  const { data: totalCollateralInfo } = useTotalsCollateral(
    marketContract,
    dashboardStore.collaterals
  );
  const { data: collateralConfigurations } =
    useCollateralConfigurations(marketContract);

  //const vm = useDashboardVM();
  const token = TOKENS_BY_ASSET_ID[assetId];
  if (collateralConfigurations == null || totalCollateralInfo == null)
    return null;
  const stats = collateralConfigurations[assetId];
  const price = getFormattedTokenPrice(token.assetId);
  const penalty = BN.formatUnits(
    stats.liquidation_penalty.toString(),
    4
  ).toFormat(2);
  const collFactor = BN.formatUnits(
    stats.borrow_collateral_factor.toString(),
    4
  ).toFormat(2);
  const supplyCap = BN.formatUnits(
    stats.supply_cap.toString(),
    token.decimals
  ).toFormat(2);
  const collateralAmount = BN.formatUnits(
    totalCollateralInfo[token.assetId],
    token.decimals
  ).toFormat(2);

  const tokenData = [
    { title: 'Oracle price', value: price },
    { title: 'Collateral factor', value: `${collFactor}%` },
    { title: 'Liquidation penalty', value: `${penalty}%` },
    { title: 'Supply cap', value: `${supplyCap} ${token.symbol}` },
    {
      title: 'Total supplied',
      value: `${collateralAmount} ${token.symbol}`,
    },
    {
      title: 'Wallet balance',
      value: `${accountStore.getFormattedBalance(token)}  ${token.symbol}`,
    },
  ];
  return (
    <Root>
      <Text weight={600} size="medium">
        {token.name}
      </Text>
      <SizedBox height={12} />
      <Container crossAxisSize="max">
        {tokenData.map(({ title, value }, index) => (
          <Row key={index} alignItems="center" justifyContent="space-between">
            <Text fitContent weight={600} type="secondary">
              {title}
            </Text>
            <Text fitContent weight={600}>
              {value}
            </Text>
          </Row>
        ))}
      </Container>
    </Root>
  );
};
export default observer(TokenInfo);
