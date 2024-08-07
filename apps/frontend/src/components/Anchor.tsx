import type React from 'react';
import type { AnchorHTMLAttributes } from 'react';

export const Anchor: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  children,
  ...rest
}) => (
  <a rel="noreferrer noopener" target="_blank" {...rest}>
    {children}
  </a>
);
