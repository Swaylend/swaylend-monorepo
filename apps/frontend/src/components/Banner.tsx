import styled from '@emotion/styled';
import React, { useState } from 'react';

export const Banner = () => {
  const [open, setOpen] = useState(true);

  const BannerContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.primary01};
  color: ${({ theme }) => theme.colors.neutral5};
  padding: 16px;
  border-radius: 4px;
  position: fixed;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

  const BannerText = styled.span`
  font-size: 16px;
`;

  const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral5};
  font-size: 32px;
  cursor: pointer;
  &:hover {
    opacity: 80%;
  }
`;

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <BannerContainer>
      <BannerText>
        This is an experimental version. Please be aware that the state and data
        may be reset.
      </BannerText>
      <CloseButton onClick={handleClose}>&times;</CloseButton>
    </BannerContainer>
  );
};
