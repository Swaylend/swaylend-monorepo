const ERRORS = {
  "TypeError: Cannot read properties of undefined (reading 'waitForResult')":
    'There was a problem.',
  'FuelError: not enough coins to fit the target':
    'FuelError: not enough coins to fit the target',
  'FuelError: The transaction reverted with reason: "…t/fuel_asm/enum.PanicReason.html#variant.OutOfGas':
    'Execution ran out of gas.',
  'FuelError: The transaction reverted because a "require" statement has thrown "NotCollateralized".':
    'Cannot withdraw more than collateralized. Try lowering the amount.',
} as Record<string, string>;

export const errorToMessage = (error: string) => {
  if (
    error.startsWith(
      `FuelError: The transaction reverted with reason: "OutOfGas"`
    )
  )
    return 'Execution ran out of gas. Try again.';
  return ERRORS[error] || 'An error occurred. Please try again later.';
};
