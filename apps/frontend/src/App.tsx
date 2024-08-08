import { Column } from '@components/Flex';
import Footer from '@components/Footer';
import Header from '@components/Header/Header';
import styled from '@emotion/styled';
import Dashboard from '@screens/Dashboard';
import Faucet from '@screens/Faucet';
import Tutorial from '@screens/Tutorial';
import Tutorials from '@screens/Tutorials';
import { ROUTES } from '@src/constants';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.mainBackground};
  min-height: 100vh;
`;
const App: React.FC = () => {
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
