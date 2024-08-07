import Switch from '@components/Switch';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { THEME_TYPE } from '@src/themes/ThemeProvider';
import { useStores } from '@stores';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import type { HTMLAttributes } from 'react';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  text?: boolean;
}

const Root = styled.div`
  display: flex;
  border-radius: 12px;
  gap: 11px;
  align-items: center;
`;

const DarkMode: React.FC<IProps> = ({ text, ...rest }) => {
  const { settingsStore } = useStores();
  return (
    <Root {...rest}>
      {text && <Text weight={700}>Dark mode</Text>}
      <Switch
        onChange={() => settingsStore.toggleTheme()}
        value={settingsStore.selectedTheme === THEME_TYPE.DARK_THEME}
      />
    </Root>
  );
};
export default observer(DarkMode);
