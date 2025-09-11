import type BigNumber from 'bignumber.js';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const CircularProgressBar = ({ percent }: { percent: BigNumber }) => {
  return (
    <CircularProgressbar
      maxValue={1}
      strokeWidth={8}
      styles={buildStyles({
        textSize: 26,
        pathColor: '#3FE8BD',
        textColor: '#8D98AF',
        trailColor: '#3D3E52',
        backgroundColor: '#3D3E52',
      })}
      text={`${percent.times(100).decimalPlaces(1)}%`}
      value={percent.toNumber()}
    />
  );
};
