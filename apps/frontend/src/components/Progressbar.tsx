import styled from '@emotion/styled';
import type React from 'react';

interface IProps {
  percent: number;
  red?: boolean;
}

const Root = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.progressBar.secondary};
  border-radius: 4px;

  .progress {
    border-radius: 4px;
    height: 4px;
  }

  .normal {
    background: ${({ theme }) => theme.colors.progressBar.main};
  }
  
  .warning {
    background: #FFC107;
  }

  .danger {
    background: #DC3545;
  }
`;

const Progressbar: React.FC<IProps> = ({ percent }) => {
  return (
    <Root>
      <div
        className={`progress ${percent < 60 && 'normal'} ${percent > 80 && 'danger'} ${percent >= 60 && percent < 80 && 'warning'}`}
        style={{ width: `${percent}%` }}
      />
    </Root>
  );
};
export default Progressbar;
