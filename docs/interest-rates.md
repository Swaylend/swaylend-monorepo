# Interest Rates

Users with a positive balance of the base asset earn interest, denominated in the base asset, based on a supply rate model; users with a negative balance pay interest based on a borrow rate model. These are separate interest rate models, and set by governance.

The supply and borrow interest rates are a function of the utilization rate of the base asset. Each model includes a utilization rate “kink” - above this point the interest rate increases more rapidly. Interest accrues every second using the block timestamp.

Collateral assets do not earn or pay interest.

### &#x20;Get Supply Rate

This function returns the per second supply rate as the decimal representation of a percentage scaled up by `10 ^ 18`. The formula for producing the supply rate is:

```ini
## If the Utilization is less than or equal to the Kink parameter

SupplyRate = supplyPerSecondInterestRateBase + supplyPerSecondInterestRateSlopeLow * utilization

## Else

SupplyRate = supplyPerSecondInterestRateBase + supplyPerSecondInterestRateSlopeLow * supplyKink + supplyPerSecondInterestRateSlopeHigh * (utilization - supplyKink)

```

To calculate the Compound III supply APR as a percentage, pass the current utilization to this function, divide the result by `10 ^ 18` and multiply by the approximate number of seconds in one year, and scale up by 100.

```solidity
Seconds Per Year = 60 * 60 * 24 * 365
Utilization = getUtilization()
Supply Rate = getSupplyRate(Utilization)
Supply APR = Supply Rate / (10 ^ 18) * Seconds Per Year * 100
```

#### Get Borrow Rate <a href="#get-borrow-rate" id="get-borrow-rate"></a>

This function returns the per second borrow rate as the decimal representation of a percentage scaled up by `10 ^ 18`. The formula for producing the borrow rate is:

```ini
## If the Utilization is less than or equal to the Kink parameter

BorrowRate = borrowPerSecondInterestRateBase + borrowPerSecondInterestRateSlopeLow * utilization

## Else

BorrowRate = borrowPerSecondInterestRateBase + borrowPerSecondInterestRateSlopeLow * borrowKink + borrowPerSecondInterestRateSlopeHigh * (utilization - borrowKink)
```

To calculate the Compound III borrow APR as a percentage, pass the current utilization to this function, and divide the result by `10 ^ 18` and multiply by the approximate number of seconds in one year and scale up by 100.

```solidity
Seconds Per Year = 60 * 60 * 24 * 365
Utilization = getUtilization()
Borrow Rate = getBorrowRate(Utilization)
Borrow APR = Borrow Rate / (10 ^ 18) * Seconds Per Year * 100
```

#### Get Utilization <a href="#get-utilization" id="get-utilization"></a>

This function returns the current protocol utilization of the base asset. The formula for producing the utilization is:

`Utilization = TotalBorrows / TotalSupply`
