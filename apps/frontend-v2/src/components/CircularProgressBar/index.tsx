import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const CircularProgressBar = ({ percent }: { percent: number }) => {
  return (
    <CircularProgressbar
      value={percent}
      maxValue={1}
      text={`${percent * 100}%`}
      strokeWidth={10}
      styles={buildStyles({
        textSize: 28,
        pathColor: '#3FE8BD',
        textColor: '#8D98AF',
        trailColor: '#3D3E52',
        backgroundColor: '#3D3E52',
      })}
    />
  );
};
