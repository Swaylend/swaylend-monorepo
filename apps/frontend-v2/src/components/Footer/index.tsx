import React from 'react';
import { Line } from '../Line';

export const Footer = () => {
  return (
    <>
      <Line />
      <div className="relative flex justify-between overflow-hidden items-center px-16 py-4 text-neutral4">
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
        <a href="#">Terms</a>
        Swaylend. All Rights Reserved. © 2024
        <div className="absolute top-[calc(100%)] opacity-60 rounded-full left-[calc(50%-250px)] w-[500px] h-[200px] z-[-10] bg-accent blur-3xl" />
      </div>
    </>
  );
};
