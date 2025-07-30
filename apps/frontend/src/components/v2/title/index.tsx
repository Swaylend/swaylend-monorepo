import type React from 'react';

export const Title: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex w-full items-center font-semibold text-sm">
      <div className="h-[2px] w-1/3 rounded-full bg-linear-to-r from-background to-primary" />
      <div className="w-1/3 text-center text-moon">{children}</div>
      <div className="h-[2px] w-1/3 rounded-full bg-linear-to-l from-background to-primary" />
    </div>
  );
};
