# Liquidations

Liquidation is a safety mechanism that ensures that all new borrowing positions are protected. It's based on higher collateral factors than the ones used for borrowing. If a borrower's debt goes over the limits set by these collateral factors, their account becomes eligible for liquidation.

A liquidator, which can be a bot, contract, or user, then takes over the borrower's collateral and returns its value, minus a penalty, to the borrower. This eliminates the borrower's debt and they typically receive a balance of the base asset as a result. The protocol pays for each liquidation using its reserves of the base asset and in return, it receives the collateral assets. If the reserves are lower than the target set by governance, liquidators can purchase the collateral at a discount using the base asset, which increases the protocol's base asset reserves.
