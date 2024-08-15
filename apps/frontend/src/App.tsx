import { Column } from '@components/Flex';
import Footer from '@components/Footer';
import Header from '@components/Header/Header';
import styled from '@emotion/styled';
import { useAccount, useBalance, useFuel, useProvider } from '@fuels/react';
import Dashboard from '@screens/Dashboard';
import Faucet from '@screens/Faucet';
import Market from '@screens/Market';
// import Tutorial from '@screens/Tutorial';
// import Tutorials from '@screens/Tutorials';
import { ROUTES, TOKENS_BY_SYMBOL } from '@src/constants';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useStores } from './stores';

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.mainBackground};
  min-height: 100vh;
`;
const App: React.FC = () => {
  const { accountStore } = useStores();
  const { provider } = useProvider();
  const { fuel } = useFuel();
  const { account } = useAccount();

  useEffect(() => {
    accountStore.initFuel(fuel);
    accountStore.initProvider(provider);
  });

  const { balance } = useBalance({
    address: account ?? undefined,
    assetId: TOKENS_BY_SYMBOL.ETH.assetId,
  });

  console.log(
    '󰊠 ~ file: App.tsx:34 ~ balance:',
    balance?.format({ precision: 4, units: TOKENS_BY_SYMBOL.ETH.decimals })
  );

  return (
    <Root>
      <Header />
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.FAUCET} element={<Faucet />} />
        <Route path={ROUTES.MARKET} element={<Market />} />
        {/* <Route path={ROUTES.TUTORIALS} element={<Tutorials />} />
        <Route path={ROUTES.TUTORIAL} element={<Tutorial />} /> */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} />} />
      </Routes>
      <Footer />
    </Root>
  );
};

export default observer(App);
