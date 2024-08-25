import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ROUTES } from '@src/constants';
import isRoutesEquals from '@src/utils/isRoutesEquals';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Wallet from '../Wallet';

interface IProps {
  onClose: () => void;
  opened: boolean;
}

const Root = styled.div<{ opened: boolean }>`
  z-index: 100;
  background: ${({ theme }) => `${theme.colors.modal.mask}`};
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  height: calc(100vh - 64px);
  transition: 0.2s;
  overflow: hidden;

  ${({ opened }) => !opened && 'height: 0px;'}
`;
const Body = styled.div`
  display: flex;
  background: pink;
  width: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.mainBackground};
`;

const WalletWrapper = styled.div`
  padding: 16px;
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  cursor: pointer;
  flex-direction: row;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 4px;
  width: 100%;
  background: ${({ selected, theme }) =>
    selected && theme.colors.header.navLinkBackground};

  &:hover {
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  max-height: 50vh;

  & > * {
    margin-bottom: 8px;
  }
`;
const MobileMenu: React.FC<IProps> = ({ opened, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      link: ROUTES.DASHBOARD,
      icon: theme.images.icons.dashboard,
    },
    {
      name: 'Faucet',
      link: ROUTES.FAUCET,
      icon: theme.images.icons.coins,
    },
    // {
    //   name: 'Tutorials',
    //   link: ROUTES.FAUCET,
    //   icon: theme.images.icons.coins,
    // },
    {
      name: 'Market',
      link: ROUTES.MARKET,
      icon: theme.images.icons.moon,
    },
  ];
  return (
    <Root {...{ opened }}>
      <Body>
        <Container>
          {menuItems.map(({ name, link, icon }) => (
            <MenuItem
              key={name}
              selected={isRoutesEquals(link, location.pathname)}
              onClick={() => navigate(link)}
            >
              <img style={{ width: 24, height: 24 }} src={icon} alt="nav" />
              <SizedBox width={4} />
              <Text weight={700}>{name}</Text>
            </MenuItem>
          ))}
        </Container>
        <WalletWrapper>
          <Wallet />
        </WalletWrapper>
      </Body>
    </Root>
  );
};
export default observer(MobileMenu);
