import { Column } from '@components/Flex';
import Footer from '@components/Footer';
import Header from '@components/Header/Header';
import styled from '@emotion/styled';
import { useFuel, useProvider } from '@fuels/react';
import Dashboard from '@screens/Dashboard';
import Faucet from '@screens/Faucet';
// import Tutorial from '@screens/Tutorial';
// import Tutorials from '@screens/Tutorials';
import { ROUTES } from '@src/constants';
import type React from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
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

  useEffect(() => {
    accountStore.initFuel(fuel);
    accountStore.initProvider(provider);
  });

  return (
    <Root>
      <Header />
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.FAUCET} element={<Faucet />} />
        {/* <Route path={ROUTES.TUTORIALS} element={<Tutorials />} />
        <Route path={ROUTES.TUTORIAL} element={<Tutorial />} /> */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} />} />
      </Routes>
      <Footer />
    </Root>
  );
};

export default observer(App);
