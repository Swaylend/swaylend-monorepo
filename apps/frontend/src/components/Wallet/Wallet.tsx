import Button from '@components/Button';
import LoggedInAccountInfo from '@components/Wallet/LoggedInAccountInfo';
import styled from '@emotion/styled';
import { useStores } from '@stores';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import LoginModal from './LoginModal';

type IProps = any;

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Wallet: React.FC<IProps> = () => {
  const { accountStore, settingsStore } = useStores();
  return (
    <Root>
      {accountStore.address == null ? (
        <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
          Connect wallet
        </Button>
      ) : (
        <LoggedInAccountInfo />
      )}
      <LoginModal
        visible={settingsStore.loginModalOpened}
        onClose={() => settingsStore.setLoginModalOpened(false)}
      />
    </Root>
  );
};
export default observer(Wallet);
