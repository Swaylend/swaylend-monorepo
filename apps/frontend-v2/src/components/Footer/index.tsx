import React from 'react';
import { Line } from '../Line';

export const Footer = () => {
  return (
    <>
      <Line />
      <div className="flex justify-between items-center px-16 py-4 text-neutral4">
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
        <a href="#">Terms</a>© 2024 Swaylend. All Rights Reserved.
      </div>
    </>
  );
};
