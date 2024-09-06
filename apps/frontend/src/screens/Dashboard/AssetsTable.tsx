import Text from '@components/Text';
import styled from '@emotion/styled';
import TokenRowDisplay from '@src/components/TokenRowDisplay';
import { useStores } from '@stores';
import { observer } from 'mobx-react-lite';
import type React from 'react';

type IProps = any;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 6fr 6fr 4fr;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 2px;
  background: ${({ theme }) => theme.colors.dashboard.tokenRowColor};
`;

const AssetsTable: React.FC<IProps> = () => {
  const { dashboardStore } = useStores();
  return (
    <Root>
      <Header>
        <Text size="small" type="secondary">
          Collateral asset
        </Text>
        <Text />
        <Text size="small" type="secondary">
          Protocol balance
        </Text>
      </Header>
      {dashboardStore.collaterals.map((token) => (
        <TokenRowDisplay key={token.assetId} token={token} />
      ))}
    </Root>
  );
};
export default observer(AssetsTable);
