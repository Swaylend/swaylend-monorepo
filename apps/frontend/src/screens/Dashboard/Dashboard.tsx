import Layout from '@components/Layout';
import SizedBox from '@components/SizedBox';
import styled from '@emotion/styled';
import DashboardStats from '@screens/Dashboard/DashboardStats';
import { Column } from '@src/components/Flex';
import useWindowSize from '@src/hooks/useWindowSize';
import { Observer } from 'mobx-react-lite';
import type React from 'react';
import ActionTab from './ActionTab';
import AssetsTable from './AssetsTable';
import AvailableToBorrow from './AvailableToBorrow';
import SwitchActions from './SwitchActions';

type IProps = any;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  margin-bottom: 24px;
  margin-top: 20px;
  text-align: left;
  @media (min-width: 880px) {
    margin-top: 40px;
  }
`;
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 880px) {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 20px;
  }
`;
const DashboardImpl: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <DashboardStats />
            <SizedBox height={16} />
            <MainContainer>
              {width && width >= 880 ? (
                <>
                  <Column crossAxisSize="max">
                    <AvailableToBorrow />
                    <SizedBox height={16} />
                    <AssetsTable />
                  </Column>
                  <Column crossAxisSize="max">
                    <SwitchActions />
                    <SizedBox height={16} />
                    <ActionTab />
                  </Column>
                </>
              ) : (
                <>
                  <AvailableToBorrow />
                  <SizedBox height={16} />
                  <SwitchActions />
                  <SizedBox height={16} />
                  <ActionTab />
                  <SizedBox height={16} />
                  <AssetsTable />
                </>
              )}
            </MainContainer>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Dashboard: React.FC<IProps> = () => <DashboardImpl />;
export default Dashboard;
