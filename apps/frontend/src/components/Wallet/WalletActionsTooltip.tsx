import { Column } from '@components/Flex';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { useAccount, useDisconnect } from '@fuels/react';
import { EXPLORER_URL } from '@src/constants';
import getAddressB256 from '@src/utils/address';
import { useStores } from '@stores';
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
  const { notificationStore, settingsStore } = useStores();
  const { disconnect } = useDisconnect();
  const { account } = useAccount();

  return (
    <Root alignItems="center">
      <Text
        weight={700}
        onClick={() => {
          copy(getAddressB256(account));
          notificationStore.toast('Your address was copied', {
            type: 'info',
          });
        }}
        className="menu-item"
      >
        Copy address
      </Text>
      <SizedBox height={10} />
      <Text
        className="menu-item"
        onClick={() =>
          window.open(`${EXPLORER_URL}/account/${getAddressB256(account)}`)
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
      <Text weight={700} onClick={() => disconnect()} className="menu-item">
        Disconnect
      </Text>
    </Root>
  );
};
export default observer(WalletActionsTooltip);
