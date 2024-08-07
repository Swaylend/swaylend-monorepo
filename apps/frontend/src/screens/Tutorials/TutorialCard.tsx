import Button from '@components/Button';
import SizedBox from '@components/SizedBox';
import Text from '@components/Text';
import styled from '@emotion/styled';
import { Row } from '@src/components/Flex';
import type React from 'react';

interface IProps {
  title: string;
  complexity: string;
  time: string;
  pic: string;
  link?: string;
  onClick: () => void;
}

const Root = styled.div`
  display: flex;
  border-radius: 4px;
  flex-direction: column;
  padding: 16px;
  background: ${({ theme }) => theme.colors.tutorial.background};
`;
const Pic = styled.img`
  width: 100%;
  border-radius: 4px;
`;
const TutorialCard: React.FC<IProps> = ({
  title,
  complexity,
  time,
  pic,
  link,
  onClick,
}) => {
  return (
    <Root>
      <Pic src={pic} alt={pic} />
      <SizedBox height={12} />
      <Text size="medium" weight={700}>
        {title}
      </Text>
      <SizedBox height={12} />
      <Row justifyContent="space-between">
        <Text type="secondary" weight={600} fitContent>
          Complexity
        </Text>
        <Text weight={600} fitContent>
          {complexity}
        </Text>
      </Row>
      <SizedBox height={12} />
      <Row justifyContent="space-between">
        <Text type="secondary" weight={600} fitContent>
          Average time
        </Text>
        <Text weight={600} fitContent>
          {time}
        </Text>
      </Row>
      <SizedBox height={12} />
      <Button
        style={{ marginTop: 'auto' }}
        fixed
        disabled={link == null}
        onClick={onClick}
      >
        {link == null ? 'Coming soon' : 'Start tutorial'}
      </Button>
    </Root>
  );
};
export default TutorialCard;
