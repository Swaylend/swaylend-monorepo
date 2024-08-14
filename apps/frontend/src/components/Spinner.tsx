import styled from '@emotion/styled';

const StyledSpinner = styled.div`
  border: ${({ theme }) => `4px solid ${theme.colors.mainBackground};`}
  border-top: ${({ theme }) => `4px ${theme.colors.primary01} solid;`} 
  border-radius: 50%;
  height: 16px;
  width: 16px;
  margin-right: 8px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

const Spinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <StyledSpinner />
  </div>
);

export default Spinner;
