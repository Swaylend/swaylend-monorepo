# Collateral & Borrowing

Users can add collateral assets to their account using the [_supply_](https://docs.compound.finance/collateral-and-borrowing/#supply) function. Collateral can only be added if the market is below its [_supplyCap_](https://docs.compound.finance/helper-functions/#get-asset-info-by-address), which limits the protocol’s risk exposure to collateral assets.

Each collateral asset increases the user’s borrowing capacity, based on the asset’s [_borrowCollateralFactor_](https://docs.compound.finance/helper-functions/#get-asset-info-by-address). The borrowing collateral factors are percentages that represent the portion of collateral value that can be borrowed.

For instance, if the borrow collateral factor for WBTC is 85%, an account can borrow up to 85% of the USD value of its supplied WBTC in the base asset. Collateral factors can be fetched using the [_Get Asset Info By Address_](https://docs.compound.finance/helper-functions/#get-asset-info-by-address) function.

The base asset can be borrowed using the [_withdraw_](https://docs.compound.finance/collateral-and-borrowing/#withdraw-or-borrow) function; the resulting borrow balance must meet the borrowing collateral factor requirements. If a borrowing account subsequently fails to meet the borrow collateral factor requirements, it cannot borrow additional assets until it supplies more collateral, or reduces its borrow balance using the supply function.

Account _balances_ for the base token are signed integers. An account balance greater than zero indicates the base asset is supplied and a balance less than zero indicates the base asset is borrowed. _Note: Base token balances for assets with 18 decimals will start to overflow at a value of 2103/1e18=\~10 trillion._

Account balances are stored internally in Comet as _principal_ values (also signed integers). The principal value, also referred to as the day-zero balance, is what an account balance at _T0_ would have to be for it to be equal to the account balance today after accruing interest.

Global _indices_ for supply and borrow are unsigned integers that increase over time to account for the interest accrued on each side. When an account interacts with the protocol, the indices are updated and saved. An account’s present balance can be calculated using the current index with the following formulas.

```solidity
Balance = Principal * BaseSupplyIndex [Principal > 0]
Balance = Principal * BaseBorrowIndex [Principal < 0]
```

