import styled from '@emotion/styled';

type TTextType =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'primary-text'
  | 'secondary-text';
type TTextSize = 'tiny' | 'small' | 'medium' | 'large' | 'big';
type TTextAlign = 'center' | 'left' | 'right' | 'justify' | 'end';

const Text = styled.p<{
  type?: TTextType;
  weight?: 400 | 500 | 600 | 700;
  size?: TTextSize;
  fitContent?: boolean;
  nowrap?: boolean;
  crossed?: boolean;
  ellipsis?: number;
  textAlign?: TTextAlign;
}>`
  margin: 0;
  width: ${({ fitContent }) => (fitContent ? 'fit-content' : '100%')};
  font-weight: ${({ weight }) => weight ?? 500};
  white-space: ${({ nowrap }) => (nowrap ? 'nowrap' : 'unset')};
  text-decoration: ${({ crossed }) => (crossed ? 'line-through' : 'unset')};
  text-align: ${({ textAlign }) => textAlign ?? 'default'};
  ${({ type, theme }) =>
    (() => {
      switch (type) {
        case 'primary':
          return `color: ${theme.colors?.text};`;
        case 'secondary':
          return `color: ${theme.colors?.neutral4};`;
        case 'error':
          return `color: ${theme.colors?.secondary1};`;
        case 'primary-text':
          return `color: ${theme.colors?.primary01};`;
        case 'secondary-text':
          return `color: ${theme.colors?.secondary1};`;
        default:
          return `color: ${theme.colors?.text};`;
      }
    })()}
  ${({ ellipsis }) =>
    ellipsis != null &&
    `max-width: ${ellipsis}px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`};
  ${({ size }) =>
    (() => {
      switch (size) {
        case 'tiny':
          return 'font-size: 12px; line-height: 12px;';
        case 'small':
          return 'font-size: 13px; line-height: 16px;';
        case 'medium':
          return 'font-size: 18px; line-height: 24px;';
        case 'big':
          return 'font-size: 40px; line-height: 48px;';
        case 'large':
          return 'font-size: 64px; line-height: 64px;';
        default:
          return 'font-size: 15px; line-height: 24px;';
      }
    })()}
`;

export default Text;
