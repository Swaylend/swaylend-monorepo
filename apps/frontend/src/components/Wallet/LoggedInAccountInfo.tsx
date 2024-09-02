import { Row } from '@components/Flex';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import TokenIcon from '@components/TokenIcon';
import Tooltip from '@components/Tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useAccount, useBalance } from '@fuels/react';
import { TOKENS_BY_SYMBOL } from '@src/constants';
import getAddressB256 from '@src/utils/address';
import centerEllipsis from '@src/utils/centerEllipsis';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useState } from 'react';
import WalletActionsTooltip from './WalletActionsTooltip';

type IProps = any;

const Root = styled(Row)`
  align-items: center;
  height: fit-content;
  justify-content: space-between;
  @media (min-width: 880px) {
    justify-content: flex-end;
  }

  .balances {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
`;
const Container = styled(Row)`
  border: 2px solid
    ${({ theme }) => theme.colors.header.walletAddressBackground};
  border-radius: 4px;
`;
const BalanceContainer = styled(Row)`
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.mainBackground};
  padding: 10px 16px;
  border-radius: 4px;
`;
const AddressContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  border-radius: 4px 0 0 4px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.header.walletAddressBackground};

  :hover {
    // background: ${({ theme }) => theme.colors.neutral1};
  }

  .avatar {
    transition: 0.4s;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ expanded }) =>
      expanded ? 'rotate(-90deg)' : 'rotate(0deg)'};
  }
`;

const LoggedInAccountInfo: React.FC<IProps> = () => {
  const { account } = useAccount();
  const theme = useTheme();
  const eth = TOKENS_BY_SYMBOL.ETH;
  const { balance } = useBalance({
    address: account ?? undefined,
    assetId: eth.assetId,
  });
  const [accountOpened, setAccountOpened] = useState<boolean>(false);
  return (
    <Root>
      <SizedBox width={4} />
      <Container justifyContent="center" alignItems="center">
        <BalanceContainer>
          <TokenIcon size="tiny" src={eth.logo} alt="token" />
          <SizedBox width={4} />
          <Text size="small" weight={700}>
            {balance?.format({ units: eth.decimals, precision: 4 })}
          </Text>
        </BalanceContainer>
        <Tooltip
          config={{
            placement: 'bottom-end',
            trigger: 'click',
            onVisibleChange: setAccountOpened,
          }}
          content={<WalletActionsTooltip />}
        >
          <AddressContainer expanded={accountOpened}>
            <Text size="small" weight={700}>
              {centerEllipsis(getAddressB256(account) ?? '', 10)}
            </Text>
            <SizedBox width={4} />
            <img
              src={theme.images.icons.arrowDown}
              className="menu-arrow"
              alt="arrow"
            />
          </AddressContainer>
        </Tooltip>
      </Container>
    </Root>
  );
};
export default observer(LoggedInAccountInfo);
