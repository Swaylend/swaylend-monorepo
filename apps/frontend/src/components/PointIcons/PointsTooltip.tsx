import { Point } from '@/components/PointIcons';
import { SYMBOL_TO_ICON } from '@/utils';

export const POINTS_COLLATERAL: Point[] = [
  {
    id: '1',
    name: 'Passive Points',
    description: (
      <div className="text-md">
        Supply this asset as collateral to earn 1 Fuel Point per dollar value.
        <br /> Earn up to a <span className="text-primary">2x</span> multiplier
        if the collateral is actively used for borrowing.
        <br />
        <br />
        For more details, check out our{' '}
        <a
          href="https://swaylend.medium.com/incentivizing-useful-liquidity-on-swaylend-with-fuel-points-c2308be4b4c6"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          blog post
        </a>
        .
      </div>
    ),
    icon: SYMBOL_TO_ICON.FUEL,
    displayMultiplier: '2x',
  },
  {
    id: '2',
    name: 'Passive Points',
    description: (
      <div className="text-md">
        Supply this asset as collateral to earn 1 Fuel Point per dollar value.
        <br />
        <br />
        For more details, check out our{' '}
        <a
          href="https://swaylend.medium.com/incentivizing-useful-liquidity-on-swaylend-with-fuel-points-c2308be4b4c6"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          blog post
        </a>
        .
      </div>
    ),
    icon: SYMBOL_TO_ICON.FUEL,
    displayMultiplier: undefined,
  },
  {
    id: '3',
    name: 'Swaypoints',
    description: (
      <div className="text-md">
        Supply this asset as collateral to earn 1 Swaypoint per dollar value.
      </div>
    ),
    icon: SYMBOL_TO_ICON.SWAY,
    displayMultiplier: undefined,
  },
];

export const POINTS_BORROW: Point[] = [
  {
    id: '1',
    name: 'Activity Points',
    description: (
      <div className="text-md">
        By Borrowing USDC on Swaylend you get{' '}
        <span className="text-primary">4x</span> Fuel Points Multiplier:
        <br />-{' '}
        <span className="text-lavender font-semibold">
          2x for Borrowing Activity
        </span>
        <br />-{' '}
        <span className="text-lavender font-semibold">
          2x for using USDC as Incentivised Asset
        </span>
        <br />
        <br />
        For more details, check out our{' '}
        <a
          href="https://swaylend.medium.com/incentivizing-useful-liquidity-on-swaylend-with-fuel-points-c2308be4b4c6"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          blog post
        </a>
        .
      </div>
    ),
    icon: SYMBOL_TO_ICON.FUEL,
    displayMultiplier: '4x',
  },
  {
    id: '2',
    name: 'Swaypoints',
    description: (
      <div className="text-md">
        By Borrowing USDC on Swaylend you get a{' '}
        <span className="text-primary">5x</span> Swaypoints Multiplier.
      </div>
    ),
    icon: SYMBOL_TO_ICON.SWAY,
    displayMultiplier: '5x',
  },
];

export const POINTS_LEND: Point[] = [
  {
    id: '1',
    name: 'Activity Points',
    description: (
      <div className="text-md">
        By Lending USDC on Swaylend you get{' '}
        <span className="text-primary">4x</span> Fuel Points Multiplier:
        <br />-{' '}
        <span className="text-lavender font-semibold">
          2x for Lending Activity
        </span>
        <br />-{' '}
        <span className="text-lavender font-semibold">
          2x for using USDC as Incentivised Asset
        </span>
        <br />
        <br />
        For more details, check out our{' '}
        <a
          href="https://swaylend.medium.com/incentivizing-useful-liquidity-on-swaylend-with-fuel-points-c2308be4b4c6"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          blog post
        </a>
        .
      </div>
    ),
    icon: SYMBOL_TO_ICON.FUEL,
    displayMultiplier: '4x',
  },
  {
    id: '2',
    name: 'Swaypoints',
    description: (
      <div className="text-md">
        By Lending USDC on Swaylend you get a{' '}
        <span className="text-primary">3x</span> Swaypoints Multiplier.
      </div>
    ),
    icon: SYMBOL_TO_ICON.SWAY,
    displayMultiplier: '3x',
  },
];
