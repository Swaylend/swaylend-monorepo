import type BigNumber from 'bignumber.js';
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const CircularProgressBar = ({ percent }: { percent: BigNumber }) => {
  return (
    <CircularProgressbar
      value={percent.toNumber()}
      maxValue={1}
      text={`${percent.times(100).decimalPlaces(1)}%`}
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
