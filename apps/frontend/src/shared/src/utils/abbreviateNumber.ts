import {DefaultLocale} from "./constants";

type NumberFormatOptions = Intl.NumberFormatOptions;

const baseOptions: NumberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  currency: "USD",
  notation: "standard",
  style: "currency",
};

const SEVEN_SIG_FIGS__SCI_NOTATION_CURRENCY: NumberFormatOptions = {
  ...baseOptions,
  notation: "scientific",
  minimumSignificantDigits: 7,
  maximumSignificantDigits: 7,
};

const SHORTHAND_CURRENCY_TWO_DECIMALS: NumberFormatOptions = {
  ...baseOptions,
  notation: "compact",
};

/**
 * Formats a number as currency based on its magnitude:
 * - Default: Standard notation with 2 decimal places
 * - 1e6 to 1e16: Compact notation (e.g., 1M, 1B)
 * - > 1e16: Scientific notation with 7 significant figures
 *
 * @returns The formatted currency string
 */
function fiatValueFormatter(value: number): string {
  let options: NumberFormatOptions;

  const absValue = Math.abs(value);

  if (absValue >= 1e16) {
    options = SEVEN_SIG_FIGS__SCI_NOTATION_CURRENCY;
  } else if (absValue >= 1e6) {
    options = SHORTHAND_CURRENCY_TWO_DECIMALS;
  } else {
    options = baseOptions;
  }

  return new Intl.NumberFormat(DefaultLocale, options).format(value);
}

export default fiatValueFormatter;
