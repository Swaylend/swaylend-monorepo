import { Column, Row } from '@components/Flex';
import Progressbar from '@components/Progressbar';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import { useCollateralUtilization } from '@src/hooks/useCollateralUtilization';
import { usePrice } from '@src/hooks/usePrice';
import { useUserSupplyBorrow } from '@src/hooks/useUserSupplyBorrow';
import BN from '@src/utils/BN';
import { getMarketContract } from '@src/utils/readContracts';
import { walletToRead } from '@src/utils/walletToRead';
import { useStores } from '@stores';
import type { WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

type IProps = any;

const AvailableToBorrow: React.FC<IProps> = observer(() => {
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

  const { data: userSupplyBorrow } = useUserSupplyBorrow(
    marketContract,
    rootStore.accountStore.addressInput?.value ?? ''
  );
  const borrowedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return BN.ZERO;
    return userSupplyBorrow[1];
  }, [userSupplyBorrow, priceData]);

  const userCollateralUtilization = useCollateralUtilization(
    marketContract,
    getTokenPrice,
    rootStore
  );

  if (!rootStore.accountStore.isLoggedIn) return null;
  if (!borrowedBalance || borrowedBalance.isZero()) return null;
  return (
    <Column crossAxisSize="max">
      <Row justifyContent="space-between">
        <Text fitContent weight={600} type="secondary" size="small">
          Liquidation Risk
        </Text>
        <Text fitContent weight={600} type="secondary" size="small">
          Borrow Capacity {userCollateralUtilization?.times(100).toFixed(1)}%
        </Text>
      </Row>
      <SizedBox height={4} />
      <Progressbar
        percent={Number(userCollateralUtilization?.times(100).toFixed(1))}
      />
    </Column>
  );
});
export default AvailableToBorrow;
