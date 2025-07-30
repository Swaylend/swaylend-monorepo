import type { Point } from '@/components/v2/point-icons';
import { SYMBOL_TO_ICON } from '@/utils';

export const POINTS_COLLATERAL: Point[] = [
  {
    id: '1',
    name: 'SwayPoints',
    description: (
      <div className="text-md">
        Supply this asset as collateral to earn 1 SwayPoints per dollar value.
      </div>
    ),
    icon: SYMBOL_TO_ICON.SWAY,
    displayMultiplier: undefined,
  },
];

export const POINTS_BORROW: Point[] = [
  {
    id: '1',
    name: 'SwayPoints',
    description: (
      <div className="text-md">
        By Borrowing USDC on Swaylend you get a{' '}
        <span className="text-primary">5x</span> SwayPoints Multiplier.
      </div>
    ),
    icon: SYMBOL_TO_ICON.SWAY,
    displayMultiplier: '5x',
  },
];

export const POINTS_LEND: Point[] = [
  {
    id: '1',
    name: 'SwayPoints',
    description: (
      <div className="text-md">
        By Lending USDC on Swaylend you get a{' '}
        <span className="text-primary">3x</span> SwayPoints Multiplier.
      </div>
    ),
    icon: SYMBOL_TO_ICON.SWAY,
    displayMultiplier: '3x',
  },
];

export const POINTS_LM: Point[] = [
  {
    id: '1',
    name: 'FUEL Token Rewards',
    description: null,
    icon: SYMBOL_TO_ICON.FUEL,
    displayMultiplier: undefined,
  },
];
