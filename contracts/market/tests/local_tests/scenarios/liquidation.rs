// **Scenario #3 - Absorb and liquidate**

// Description: User who borrows base asset is liquidated.

// Code: <insert link to the test file>

// Steps:

// - User A supplies 1000 USDC
// - User B supplies 1 ETH
// - User B borrows <MAX HE CAN BORROW>
// - Price of ETH falls (update oracle price)
// - User C calls absorb
// - User A buys collateral asset from protocol

// Additional things to try: try to buy more collateral assets from protocol, price of ETH falls but no enough (user B should not be liquidated), check that reserve received money

// **Scenario #11 - All assets are being liquidated**

// Description: Test that all assets are being liquidated.

// Code: <insert link to the test file>

// Steps:
