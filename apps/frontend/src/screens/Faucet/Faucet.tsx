import Layout from '@components/Layout';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { FaucetVMProvider, useFaucetVM } from '@screens/Faucet/FaucetVm';
import TokensFaucetTable from '@screens/Faucet/TokensFaucetTable';
import { useStores } from '@stores';
import { Observer } from 'mobx-react-lite';
import type React from 'react';
import Skeleton from 'react-loading-skeleton';

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

const FaucetImpl: React.FC = () => {
  const vm = useFaucetVM();
  const { accountStore } = useStores();
  return (
    <Layout>
      <Observer>
        {() => {
          return (
            <Root>
              <Text weight={600} size="big">
                Faucet for Fuel Network
              </Text>
              {!accountStore.isLoggedIn && (
                <>
                  <SizedBox height={8} />
                  <Text>Connect wallet to mint tokens</Text>
                  <SizedBox height={8} />
                </>
              )}
              <SizedBox height={16} />
              {vm.faucetTokens.length === 0 ? (
                <Skeleton height={70} style={{ margin: 4 }} count={5} />
              ) : (
                <TokensFaucetTable />
              )}
            </Root>
          );
        }}
      </Observer>
    </Layout>
  );
};

const Faucet: React.FC = () => (
  <FaucetVMProvider>
    <FaucetImpl />
  </FaucetVMProvider>
);
export default Faucet;
