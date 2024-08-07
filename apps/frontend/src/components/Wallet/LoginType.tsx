import Img from '@components/Img';
import Text from '@components/Text';
// import SizedBox from "@components/SizedBox";
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type React from 'react';
import type { HTMLAttributes } from 'react';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  active: boolean;
}

const Root = styled.div<{ disable?: boolean }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  box-sizing: border-box;
  cursor: ${({ disable }) => (disable ? 'not-allowed' : 'pointer')};
`;

const LoginType: React.FC<IProps> = ({ title, onClick, active, ...rest }) => {
  const theme = useTheme();
  return (
    <Root {...rest} onClick={onClick} disable={!active}>
      <Text weight={700}>{title}</Text>
      <Img src={theme.images.icons.rightArrow} alt="rightArrow" />
    </Root>
  );
};
export default LoginType;
