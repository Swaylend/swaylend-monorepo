import Button from '@components/Button';
import LoggedInAccountInfo from '@components/Wallet/LoggedInAccountInfo';
import styled from '@emotion/styled';
import { useConnectUI, useIsConnected } from '@fuels/react';
import { useStores } from '@stores';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect } from 'react';

type IProps = any;

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Wallet: React.FC<IProps> = () => {
  const { notificationStore } = useStores();
  const { isConnected } = useIsConnected();
  const { connect, error } = useConnectUI();

  useEffect(() => {
    if (error) {
      notificationStore.toast(error.message, {
        type: 'error',
        title: 'Oops..',
      });
    }
  }, [error]);

  return (
    <Root>
      {!isConnected ? (
        <Button fixed onClick={() => connect()}>
          Connect wallet
        </Button>
      ) : (
        <LoggedInAccountInfo />
      )}
    </Root>
  );
};
export default observer(Wallet);
