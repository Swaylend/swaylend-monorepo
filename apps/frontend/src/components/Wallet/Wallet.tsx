import Button from '@components/Button';
import LoggedInAccountInfo from '@components/Wallet/LoggedInAccountInfo';
import styled from '@emotion/styled';
import { useConnectUI, useIsConnected } from '@fuels/react';
import { observer } from 'mobx-react-lite';
import type React from 'react';

type IProps = any;

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Wallet: React.FC<IProps> = () => {
  const { isConnected } = useIsConnected();
  const { connect } = useConnectUI();

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
