import type React from 'react';

export const Title: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="w-full items-center font-semibold text-sm flex">
      <div className="w-1/3 rounded-full h-[2px] bg-gradient-to-r from-background to-primary" />
      <div className="w-1/3 text-center text-moon">{children}</div>
      <div className="w-1/3 rounded-full h-[2px] bg-gradient-to-l from-background to-primary" />
    </div>
  );
};
