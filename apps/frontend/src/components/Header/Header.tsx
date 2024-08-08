import { Column, Row } from '@components/Flex';
import MobileMenu from '@components/Header/MobileMenu';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import attention from '@src/assets/icons/attention.svg';
import { ROUTES } from '@src/constants';
import isRoutesEquals from '@src/utils/isRoutesEquals';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Banner } from '../Banner';
import MobileMenuIcon from '../MobileMenuIcon';
import Wallet from '../Wallet';

type IProps = any;

const Root = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.mainBackground};
  align-items: center;
  z-index: 102;
`;

const TopMenu = styled.header`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
  max-width: 1300px;
  z-index: 102;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.mainBackground};

  .logo {
    height: 30px;
    @media (min-width: 880px) {
      height: 36px;
    }
  }

  .icon {
    cursor: pointer;
  }
`;
const MenuItem = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  margin: 0 4px;
  background: #313a45;
  border-radius: 4px;

  ${({ selected, theme }) =>
    selected
      ? `color:${theme.colors.header.navLinkBackground}; background:${theme.colors.header.navLinkBackground};`
      : `color:${theme.colors.header.navLinkBackground}; background: none;`};

  &:hover {
    background: ${({ theme }) => theme.colors.header.navLinkBackground};
    opacity: 0.4;
  }
`;

const Mobile = styled.div`
  display: flex;
  min-width: fit-content;
  @media (min-width: 880px) {
    display: none;
  }
`;

const Desktop = styled.div`
  display: none;
  min-width: fit-content;
  @media (min-width: 880px) {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const Header: React.FC<IProps> = () => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const toggleMenu = (state: boolean) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.classList.toggle('noscroll', state);
    setMobileMenuOpened(state);
  };
  const navigate = useNavigate();

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
    //   link: ROUTES.TUTORIALS,
    //   icon: attention,
    // },
  ];

  return (
    <Root>
      <Banner />
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <a href="https://swaylend.com">
            <img className="logo" src={theme.images.icons.logo} alt="logo" />
          </a>
          <Desktop>
            <SizedBox width={40} />
            {menuItems.map(({ name, link, icon }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                onClick={() => navigate(link)}
              >
                <img src={icon} alt="nav" />
                <SizedBox width={4} />
                <Text size="small" weight={700}>
                  {name}
                </Text>
              </MenuItem>
            ))}
          </Desktop>
        </Row>
        <Mobile>
          <MobileMenuIcon
            onClick={() => toggleMenu(!mobileMenuOpened)}
            opened={mobileMenuOpened}
          />
        </Mobile>
        <Desktop>
          <Wallet />
        </Desktop>
      </TopMenu>
      <Mobile>
        <MobileMenu
          opened={mobileMenuOpened}
          onClose={() => toggleMenu(false)}
        />
      </Mobile>
    </Root>
  );
};
export default observer(Header);
