import Button from '@components/Button';
import SizedBox from '@components/SizedBox';
import styled from '@emotion/styled';
import { PYTH_CONTRACT_ABI } from '@pythnetwork/pyth-fuel-js';
import InputCard from '@screens/Dashboard/ActionTab/InputCard';
import useCollapse from '@src/components/Collapse';
import { Row } from '@src/components/Flex';
import { TOKENS_BY_SYMBOL } from '@src/constants';
import { useAvailableToBorrow } from '@src/hooks/useAvailableToBorrow';
import { useUserSupplyBorrow } from '@src/hooks/useUserSupplyBorrow';
import { ACTION_TYPE } from '@src/stores/DashboardStore';
import { getMarketContract, getOracleContract } from '@src/utils/readContracts';
import { initProvider, walletToRead } from '@src/utils/walletToRead';
import { useStores } from '@stores';
import { Contract, type Provider, type WalletUnlocked } from 'fuels';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect, useState } from 'react';

type IProps = any;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ActionTab: React.FC<IProps> = () => {
  const { accountStore, settingsStore, dashboardStore } = useStores();
  const [wallet, setWallet] = useState<WalletUnlocked | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    walletToRead().then((w) => setWallet(w));
    initProvider().then((p) => setProvider(p));
  }, []);

  const marketContract = getMarketContract(
    wallet!,
    settingsStore.currentVersionConfig
  );
  const oracleContract = new Contract(
    '0x73591bf32f010ce4e83d86005c24e7833b397be38014ab670a73f6fde59ad607',
    PYTH_CONTRACT_ABI,
    wallet!
  );
  const { data: userSupplyBorrow, isSuccess: isSuccessUserSupplyBorrow } =
    useUserSupplyBorrow(marketContract, accountStore.addressInput?.value ?? '');
  const { data: maxBorrowAmount, isSuccess: isSuccessMaxBorrowAmount } =
    useAvailableToBorrow(
      marketContract,
      oracleContract,
      accountStore.addressInput?.value ?? ''
    );

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    dashboardStore.setAction(action);
    dashboardStore.setTokenAmount(null);
    dashboardStore.setActionTokenAssetId(TOKENS_BY_SYMBOL.USDC.assetId);
  };

  const { getCollapseProps } = useCollapse({
    isExpanded: dashboardStore.action == null,
    duration: 300,
  });
  return (
    <Root>
      {!accountStore.isLoggedIn && (
        <>
          <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
            Connect wallet
          </Button>
          <SizedBox height={10} />
        </>
      )}
      <div {...getCollapseProps()}>
        {dashboardStore.mode === 0 ? (
          <Row>
            <Button
              fixed
              onClick={() => handleBaseTokenClick(ACTION_TYPE.SUPPLY)}
              disabled={!accountStore.isLoggedIn}
            >
              Supply {dashboardStore.baseToken.symbol}
            </Button>
            <SizedBox width={10} />
            <Button
              fixed
              onClick={() => handleBaseTokenClick(ACTION_TYPE.WITHDRAW)}
              disabled={
                !isSuccessUserSupplyBorrow ||
                !accountStore.isLoggedIn ||
                !userSupplyBorrow ||
                userSupplyBorrow[0].eq(0)
              }
            >
              Withdraw {dashboardStore.baseToken.symbol}
            </Button>
          </Row>
        ) : (
          <Row>
            <Button
              fixed
              onClick={() => handleBaseTokenClick(ACTION_TYPE.BORROW)}
              disabled={
                !isSuccessMaxBorrowAmount ||
                !accountStore.isLoggedIn ||
                !maxBorrowAmount ||
                maxBorrowAmount.eq(0)
              }
            >
              Borrow {dashboardStore.baseToken.symbol}
            </Button>
            <SizedBox width={10} />
            <Button
              fixed
              onClick={() => handleBaseTokenClick(ACTION_TYPE.REPAY)}
              disabled={
                !isSuccessUserSupplyBorrow ||
                !accountStore.isLoggedIn ||
                !userSupplyBorrow ||
                userSupplyBorrow[1].eq(0)
              }
            >
              Repay {dashboardStore.baseToken.symbol}
            </Button>
          </Row>
        )}
      </div>
      <InputCard />
    </Root>
  );
};
export default observer(ActionTab);
