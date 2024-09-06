import Layout from '@components/Layout';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { TOKENS_BY_ASSET_ID } from '@src/constants';
import { useBalanceOf } from '@src/hooks/useBalanceOf';
import { useMarketBasics } from '@src/hooks/useMarketBasics';
import { usePrice } from '@src/hooks/usePrice';
import { useTotalsCollateral } from '@src/hooks/useTotalsCollateral';
import { useStores } from '@src/stores';
import BN from '@src/utils/BN';
import { getMarketContract } from '@src/utils/readContracts';
import { initProvider, walletToRead } from '@src/utils/walletToRead';
import type { WalletUnlocked } from 'fuels';
import { Observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  margin-bottom: 24px;
  margin-top: 40px;
  text-align: left;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    `;

const ItemColumn = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    `;

export const Market = () => {
  const rootStore = useStores();
  const { settingsStore, dashboardStore } = rootStore;
  const { data: priceData, getPrice } = usePrice(dashboardStore.allTokens);

  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
  }, []);
  const marketContract = getMarketContract(
    wallet!,
    settingsStore.currentVersionConfig
  );

  const { data: balanceOfBaseAsset } = useBalanceOf(
    marketContract,
    dashboardStore.baseToken.assetId
  );

  const { data: totalCollateralInfo } = useTotalsCollateral(
    marketContract,
    dashboardStore.collaterals
  );

  const { data: marketBasics } = useMarketBasics(marketContract);

  const valueOfBorrowed = useMemo(() => {
    if (marketBasics == null) return BN.ZERO.toFixed(0);
    return (
      BN.formatUnits(marketBasics.total_borrow_base.toString(), 6)
        //.times(getPrice(dashboardStore.baseToken.assetId))
        .toFixed(0)
    );
  }, [marketBasics, getPrice]);

  const valueOfBaseAsset = useMemo(() => {
    const baseBalance = BN.formatUnits(balanceOfBaseAsset ?? BN.ZERO, 6);
    return baseBalance
      .times(getPrice(dashboardStore.baseToken.assetId))
      .toFixed(0);
  }, [balanceOfBaseAsset, getPrice]);

  const valueOfTotalCollateral = useMemo(() => {
    if (totalCollateralInfo == null) return BN.ZERO.toFixed(0);
    return Object.entries(totalCollateralInfo)
      .reduce((acc, [assetId, v]) => {
        const token = TOKENS_BY_ASSET_ID[assetId];
        const balance = BN.formatUnits(v, token.decimals);
        const dollBalance = getPrice(assetId).times(balance);
        return acc.plus(dollBalance);
      }, BN.ZERO)
      .toFixed(0);
  }, [totalCollateralInfo, getPrice]);

  const getFormattedPrice = (price: string) => {
    const priceBN = new BN(price);
    if (priceBN.isZero()) return '$0';
    if (priceBN.gt(1000)) return `$${priceBN.div(1000).toFixed(2)}K`;
    if (priceBN.gt(1000000)) return `$${priceBN.div(100000).toFixed(0)}M`;
    return `$${priceBN}`;
  };

  return (
    <Layout>
      <Observer>
        {() => {
          return (
            <Root>
              <Text weight={600} size="big">
                USDC Markets
              </Text>
              <SizedBox height={32} />
              <Row>
                <ItemColumn>
                  <Text weight={600} size="medium" type="primary-text">
                    Total Collateral
                  </Text>
                  <SizedBox height={8} />
                  <Text size="big">
                    {getFormattedPrice(valueOfTotalCollateral)}
                  </Text>
                </ItemColumn>
                <ItemColumn>
                  <Text weight={600} size="medium" type="primary-text">
                    USDC Liquidity
                  </Text>
                  <SizedBox height={8} />
                  <Text size="big">{getFormattedPrice(valueOfBaseAsset)}</Text>
                </ItemColumn>
                <ItemColumn>
                  <Text weight={600} size="medium" type="primary-text">
                    Total Borrowing
                  </Text>
                  <SizedBox height={8} />
                  <Text size="big">{getFormattedPrice(valueOfBorrowed)}</Text>
                </ItemColumn>
                <SizedBox height={32} />
              </Row>
            </Root>
          );
        }}
      </Observer>
    </Layout>
  );
};
