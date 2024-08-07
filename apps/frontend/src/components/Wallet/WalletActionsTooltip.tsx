import { Column } from '@components/Flex';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { EXPLORER_URL } from '@src/constants';
import { useStores } from '@stores';
import { LOGIN_TYPE } from '@stores/AccountStore';
import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import type React from 'react';

type IProps = any;

const Root = styled(Column)`
  padding: 16px;

  .menu-item {
    padding: 12px 20px;
    cursor: pointer;

    :hover {
      background: ${({ theme }) => theme.colors.tooltip.hoverElement};
      border-radius: 4px;
    }
  }
`;

const WalletActionsTooltip: React.FC<IProps> = () => {
  const { notificationStore, accountStore, settingsStore } = useStores();

  const handleCopy = (object: string) => {
    object === 'address'
      ? accountStore.address && copy(accountStore.address)
      : accountStore.seed && copy(accountStore.seed);
    notificationStore.toast(`Your ${object} was copied`, { type: 'info' });
  };
  const handleLogout = () => accountStore.disconnect();

  return (
    <Root alignItems="center">
      <Text
        weight={700}
        onClick={() => handleCopy('address')}
        className="menu-item"
      >
        Copy address
      </Text>
      <SizedBox height={10} />
      <Text
        className="menu-item"
        onClick={() =>
          window.open(`${EXPLORER_URL}/account/${accountStore.address}`)
        }
        weight={700}
      >
        View in Explorer
      </Text>
      <SizedBox height={10} />
      <Text
        weight={700}
        onClick={settingsStore.exportLogData}
        className="menu-item"
      >
        Export log file
      </Text>
      <SizedBox height={10} />
      {accountStore.loginType === LOGIN_TYPE.GENERATE_SEED && (
        <>
          <Text
            weight={700}
            onClick={() => handleCopy('seed')}
            className="menu-item"
          >
            Copy seed
          </Text>
          <SizedBox height={10} />
        </>
      )}
      <Text weight={700} onClick={handleLogout} className="menu-item">
        Disconnect
      </Text>
    </Root>
  );
};
export default observer(WalletActionsTooltip);
