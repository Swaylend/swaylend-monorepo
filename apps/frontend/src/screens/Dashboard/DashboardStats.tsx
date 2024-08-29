import SizedBox from '@components/SizedBox';
import styled from '@emotion/styled';
import { useAccount } from '@fuels/react';
import Divider from '@src/components/Divider';
import { Column, Row } from '@src/components/Flex';
import Text from '@src/components/Text';
import { useBorrowRate } from '@src/hooks/useBorrowRate';
import { usePrice } from '@src/hooks/usePrice';
import { useSupplyRate } from '@src/hooks/useSupplyRate';
import { useUserCollateral } from '@src/hooks/useUserCollateral';
import { useUserSupplyBorrow } from '@src/hooks/useUserSupplyBorrow';
import useWindowSize from '@src/hooks/useWindowSize';
import { useStores } from '@src/stores';
import BN from '@src/utils/BN';
import getAddressB256 from '@src/utils/address';
import {
  getBorrowApr,
  getSupplyApr,
  getTotalSuppliedBalance,
} from '@src/utils/dashboardUtils';
import { getMarketContract } from '@src/utils/readContracts';
import { walletToRead } from '@src/utils/walletToRead';
import type { WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

const Root = styled.div`
  width: 100%;
  display: grid;
  align-items: flex-end;

  .main-data {
    font-size: 48px;
    line-height: 48px;
  }

  .data {
    font-size: 24px;
    line-height: 32px;
  }

  .title {
    font-size: 14px;
    line-height: 24px;
  }

  @media (min-width: 880px) {
    grid-template-columns: 2fr 1fr;
    .main-data {
      font-size: 64px;
      line-height: 64px;
    }

    .data {
      font-size: 40px;
      line-height: 48px;
    }

    .title {
      font-size: 18px;
      line-height: 24px;
    }
  }
`;
const DashboardStats: React.FC = () => {
  const { account } = useAccount();
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
  }, []);

  const rootStore = useStores();
  const { data: priceData, getPrice: getTokenPrice } = usePrice(
    rootStore.dashboardStore.allTokens
  );

  const marketContract = getMarketContract(
    wallet!,
    rootStore.settingsStore.currentVersionConfig
  );
  const { mode, baseToken } = rootStore.dashboardStore;

  const { data: borrowRate } = useBorrowRate(marketContract);
  const { data: supplyRate } = useSupplyRate(marketContract);
  const { data: userSupplyBorrow } = useUserSupplyBorrow(
    marketContract,
    getAddressB256(account)
  );
  const { data: collateralBalances, isLoading } = useUserCollateral(
    marketContract,
    rootStore.dashboardStore.collaterals,
    getAddressB256(account)
  );

  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);

  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  const borrowedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return BN.ZERO;
    return userSupplyBorrow[1];
  }, [userSupplyBorrow]);
  const suppliedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return BN.ZERO;
    return userSupplyBorrow[0];
  }, [userSupplyBorrow]);

  const totalSuppliedBalance = useMemo(() => {
    return getTotalSuppliedBalance(
      true,
      baseToken,
      suppliedBalance,
      collateralBalances ?? {},
      getTokenPrice
    );
  }, [userSupplyBorrow, collateralBalances, priceData]);
  const { width } = useWindowSize();

  const borrowed = BN.formatUnits(
    borrowedBalance ?? BN.ZERO,
    baseToken.decimals
  ).toFormat(2);

  return (
    <Root>
      {width && width >= 880 ? (
        isLoading ? (
          <>
            <Column>
              <Skeleton height={24} width={200} />
              <Skeleton height={64} width={200} />
            </Column>
            <Column crossAxisSize="max" alignItems="end">
              <Skeleton height={24} width={200} />
              <Skeleton height={32} width={200} />
            </Column>
          </>
        ) : (
          <>
            <Row justifyContent="space-between" alignItems="end">
              <Column crossAxisSize="max">
                <Text className="title" type="secondary" weight={600}>
                  Supplied balance
                </Text>
                <Text className="main-data" weight={600}>
                  ${totalSuppliedBalance}
                </Text>
              </Column>
              <Column crossAxisSize="max">
                <Text className="title" type="secondary" weight={600}>
                  {mode === 0 ? 'Supply APR' : 'Borrow APR'}
                </Text>
                <Text className="data" weight={600}>
                  {mode === 0 ? supplyApr : borrowApr}
                </Text>
              </Column>
            </Row>
            <Column crossAxisSize="max">
              <Text
                className="title"
                textAlign="end"
                type="secondary"
                weight={600}
              >
                Borrowed balance
              </Text>
              <Text textAlign="end" className="data" weight={600}>
                ${borrowed}
              </Text>
            </Column>
          </>
        )
      ) : isLoading ? (
        <Column crossAxisSize="max">
          <Column>
            <Skeleton height={24} width={100} />
            <Skeleton height={48} width={200} />
          </Column>
          <SizedBox height={16} />
          <Divider />
          <SizedBox height={16} />
          <Row justifyContent="space-between" alignItems="center">
            <Column>
              <Skeleton height={24} width={100} />
              <Skeleton height={32} width={100} />
            </Column>
            <Column>
              <Skeleton height={24} width={100} />
              <Skeleton height={32} width={100} />
            </Column>
          </Row>
        </Column>
      ) : (
        <>
          <Column>
            <Text className="title" type="secondary" weight={600}>
              Supplied balance
            </Text>
            <Text className="main-data" weight={600}>
              ${totalSuppliedBalance}
            </Text>
          </Column>
          <SizedBox height={16} />
          <Divider />
          <SizedBox height={16} />
          <Row alignItems="center" justifyContent="space-between">
            <Column>
              <Text className="title" type="secondary" weight={600}>
                {mode === 0 ? 'Supply APR' : 'Borrow APR'}
              </Text>
              <Text className="data" weight={600}>
                {mode === 0 ? supplyApr : supplyApr}
              </Text>
            </Column>
            <Column style={{ textAlign: 'end' }}>
              <Text className="title" type="secondary" weight={600}>
                Borrowed balance
              </Text>
              <Text className="data" weight={600}>
                ${borrowed}
              </Text>
            </Column>
          </Row>
        </>
      )}
    </Root>
  );
};
export default observer(DashboardStats);
