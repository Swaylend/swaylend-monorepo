import Text from '@components/Text';
import styled from '@emotion/styled';
import noPage from '@src/assets/404.svg';
import type React from 'react';

type IProps = any;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 140px);
  width: 100%;
`;
const Img = styled.img`
  max-width: 240px;
  height: auto;
  padding-bottom: 44px;
`;
const TechnicalWork: React.FC<IProps> = () => {
  return (
    <Root>
      <Img src={noPage} alt="noPage" />
      <Text fitContent size="big">
        Please come later
      </Text>
      <Text fitContent type="secondary" size="medium">
        App is under construction
      </Text>
    </Root>
  );
};
export default TechnicalWork;
