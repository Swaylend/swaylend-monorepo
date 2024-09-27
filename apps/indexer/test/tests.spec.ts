import assert from 'node:assert';
import {
  type AbsorbCollateralEvent,
  type BuyCollateralEvent,
  type CollateralAsset,
  type LiquidationEvent,
  type MarketConfiguartion,
  type MarketState,
  type PauseConfiguration,
  type ReservesWithdrawnEvent,
  TestHelpers,
  type User,
  type UserBaseEvent,
  type UserCollateral,
  type UserCollateralEvent,
} from 'generated';
const { MockDb, Market, Addresses } = TestHelpers;

const MARKET_ID = 'MARKET_ID';
const PUASE_CONFIGURATION_ID = 'PUASE_CONFIGURATION_ID';
const MARKET_CONFIGURATION_ID = 'MARKET_CONFIGURATION_ID';

const TEST_ASSET_ID =
  '0x17c2876b5dd4cec132ba8c7b5ea1b38d0522c6c3ca697471242f52f4ab3adbf5';
const TEST_PRICE_FEED_ID =
  '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';

const ALICE_ADDRESS = Addresses.mockAddresses[1];
const BOB_ADDRESS = Addresses.mockAddresses[2];

const I256_INDENT = 2n ** 255n;

describe('Market contract event tests', () => {
  describe('CollateralAsset events', async () => {
    it('CollateralAssetAdded -> CollateralAssetUpdated -> CollateralAssetPaused -> CollateralAssetResumed', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const assetId = TEST_ASSET_ID;

      // Creating a mock collateral asset added event
      const mockCollateralAssetAddedEvent =
        Market.CollateralAssetAdded.mockData({
          asset_id: { bits: assetId },
          configuration: {
            asset_id: { bits: assetId },
            price_feed_id: TEST_PRICE_FEED_ID,
            decimals: 0,
            borrow_collateral_factor: BigInt(0),
            liquidate_collateral_factor: BigInt(0),
            liquidation_penalty: BigInt(0),
            supply_cap: BigInt(0),
            paused: false,
          },
        });

      // Processing the mock event on the mock database
      let updatedMockDb = await Market.CollateralAssetAdded.processEvent({
        event: mockCollateralAssetAddedEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      let expectedCollateralAsset: CollateralAsset = {
        id: assetId,
        priceFeedId: TEST_PRICE_FEED_ID,
        decimals: 0,
        borrowCollateralFactor: BigInt(0),
        liquidateCollateralFactor: BigInt(0),
        liquidationPenalty: BigInt(0),
        supplyCap: BigInt(0),
        paused: false,
      };

      // Getting the entity from the mock database
      let actualCollateralAsset =
        updatedMockDb.entities.CollateralAsset.get(assetId);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedCollateralAsset, actualCollateralAsset);

      // Creating a mock collateral asset updated event
      const mockCollateralAssetUpdatedEvent =
        Market.CollateralAssetUpdated.mockData({
          asset_id: { bits: assetId },
          configuration: {
            asset_id: { bits: assetId },
            price_feed_id: TEST_PRICE_FEED_ID,
            decimals: 1,
            borrow_collateral_factor: BigInt(2),
            liquidate_collateral_factor: BigInt(3),
            liquidation_penalty: BigInt(4),
            supply_cap: BigInt(5),
            paused: false,
          },
        });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.CollateralAssetUpdated.processEvent({
        event: mockCollateralAssetUpdatedEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      expectedCollateralAsset = {
        id: assetId,
        priceFeedId: TEST_PRICE_FEED_ID,
        decimals: 1,
        borrowCollateralFactor: BigInt(2),
        liquidateCollateralFactor: BigInt(3),
        liquidationPenalty: BigInt(4),
        supplyCap: BigInt(5),
        paused: false,
      };

      // Getting the entity from the mock database
      actualCollateralAsset =
        updatedMockDb.entities.CollateralAsset.get(assetId);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedCollateralAsset, actualCollateralAsset);

      // Creating a mock collateral asset paused event
      const mockCollateralAssetPausedEvent =
        Market.CollateralAssetPaused.mockData({
          asset_id: { bits: assetId },
        });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.CollateralAssetPaused.processEvent({
        event: mockCollateralAssetPausedEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      expectedCollateralAsset = {
        id: assetId,
        priceFeedId: TEST_PRICE_FEED_ID,
        decimals: 1,
        borrowCollateralFactor: BigInt(2),
        liquidateCollateralFactor: BigInt(3),
        liquidationPenalty: BigInt(4),
        supplyCap: BigInt(5),
        paused: true,
      };

      // Getting the entity from the mock database
      actualCollateralAsset =
        updatedMockDb.entities.CollateralAsset.get(assetId);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedCollateralAsset, actualCollateralAsset);

      // Create a mock collateral resumed event
      const mockCollateralAssetResumedEvent =
        Market.CollateralAssetResumed.mockData({
          asset_id: { bits: assetId },
        });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.CollateralAssetResumed.processEvent({
        event: mockCollateralAssetResumedEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      expectedCollateralAsset = {
        id: assetId,
        priceFeedId: TEST_PRICE_FEED_ID,
        decimals: 1,
        borrowCollateralFactor: BigInt(2),
        liquidateCollateralFactor: BigInt(3),
        liquidationPenalty: BigInt(4),
        supplyCap: BigInt(5),
        paused: false,
      };

      // Getting the entity from the mock database
      actualCollateralAsset =
        updatedMockDb.entities.CollateralAsset.get(assetId);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedCollateralAsset, actualCollateralAsset);
    });
  });

  describe('User basic event', async () => {
    it('Creates a User entity with possitive principal', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // Creating a mock event
      const mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT + BigInt(100),
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedUser: User = {
        id: address,
        address: address,
        principal: BigInt(100),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      };

      // Getting the entity from the mock database
      const actualUser = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUser, actualUser);
    });
    it('Creates a User entity with negative principal', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // Creating a mock event
      const mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT - BigInt(100),
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedUser: User = {
        id: address,
        address: address,
        principal: -BigInt(100),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      };

      // Getting the entity from the mock database
      const actualUser = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUser, actualUser);
    });
    it('Updates a User entity from principal 100 -> 333', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // Creating a mock user basic event
      let mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT + BigInt(100),
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      // Processing the mock event on the mock database
      let updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      let expectedUser: User = {
        id: address,
        address: address,
        principal: BigInt(100),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      };

      // Getting the entity from the mock database
      let actualUser = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUser, actualUser);

      // Creating a mock user basic event
      mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT + BigInt(333),
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      expectedUser = {
        id: address,
        address: address,
        principal: BigInt(333),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(0),
      };

      // Getting the entity from the mock database
      actualUser = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUser, actualUser);
    });
  });

  describe('Market basic event', async () => {
    it('Creates a Market basic entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      // Create a mock market basic event
      const mockMarketBasicEvent = Market.MarketBasicEvent.mockData({
        market_basic: {
          base_borrow_index: BigInt(0),
          base_supply_index: BigInt(0),
          last_accrual_time: BigInt(0),
          total_borrow_base: BigInt(0),
          total_supply_base: BigInt(0),
          tracking_borrow_index: BigInt(0),
          tracking_supply_index: BigInt(0),
        },
      });

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.MarketBasicEvent.processEvent({
        event: mockMarketBasicEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedMarket: MarketState = {
        id: MARKET_ID,
        baseBorrowIndex: BigInt(0),
        baseSupplyIndex: BigInt(0),
        lastAccrualTime: BigInt(0),
        totalBorrowBase: BigInt(0),
        totalSupplyBase: BigInt(0),
        trackingBorrowIndex: BigInt(0),
        trackingSupplyIndex: BigInt(0),
      };

      // Getting the entity from the mock database
      const actualMarket = updatedMockDb.entities.MarketState.get(MARKET_ID);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedMarket, actualMarket);
    });
  });

  describe('User collateral events', async () => {
    it('UserSupplyCollateralEvent -> UserWithdrawCollateralEvent', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const userAddress = ALICE_ADDRESS;

      // Create a mock user collateral event
      const mockUserSupplyCollateralEvent =
        Market.UserSupplyCollateralEvent.mockData({
          account: {
            case: 'Address',
            payload: { bits: userAddress },
          },
          asset_id: { bits: TEST_ASSET_ID },
          amount: BigInt(100),
        });

      // Processing the mock event on the mock database
      let updatedMockDb = await Market.UserSupplyCollateralEvent.processEvent({
        event: mockUserSupplyCollateralEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      let expectedUserCollateralEvent: UserCollateralEvent = {
        id: `${mockUserSupplyCollateralEvent.transaction.id}_${mockUserSupplyCollateralEvent.logIndex}`,
        user_id: userAddress,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(100),
        actionType: 'Supply',
        timestamp: mockUserSupplyCollateralEvent.block.time,
      };

      // Getting the entity from the mock database
      let actualUserCollateralEvent =
        updatedMockDb.entities.UserCollateralEvent.get(
          expectedUserCollateralEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserCollateralEvent, actualUserCollateralEvent);

      // Expected entity that should be created
      let expectedUserCollateral: UserCollateral = {
        id: `${userAddress}-${TEST_ASSET_ID}`,
        user_id: userAddress,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(100),
      };

      // Should also create a UserCollateral entity
      let actualUserCollateral = updatedMockDb.entities.UserCollateral.get(
        expectedUserCollateral.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserCollateral, actualUserCollateral);

      // Create a mock user withdraw collateral event
      const mockUserWithdrawCollateralEvent =
        Market.UserWithdrawCollateralEvent.mockData({
          account: {
            case: 'Address',
            payload: { bits: userAddress },
          },
          asset_id: { bits: TEST_ASSET_ID },
          amount: BigInt(77),
        });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.UserWithdrawCollateralEvent.processEvent({
        event: mockUserWithdrawCollateralEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      expectedUserCollateralEvent = {
        id: `${mockUserWithdrawCollateralEvent.transaction.id}_${mockUserWithdrawCollateralEvent.logIndex}`,
        user_id: userAddress,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(77),
        actionType: 'Withdraw',
        timestamp: mockUserWithdrawCollateralEvent.block.time,
      };

      // Getting the entity from the mock database
      actualUserCollateralEvent =
        updatedMockDb.entities.UserCollateralEvent.get(
          expectedUserCollateralEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserCollateralEvent, actualUserCollateralEvent);

      // Expected entity that should be created
      expectedUserCollateral = {
        id: `${userAddress}-${TEST_ASSET_ID}`,
        user_id: userAddress,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(23),
      };

      // Should also update the corresponding UserCollateral entity
      actualUserCollateral = updatedMockDb.entities.UserCollateral.get(
        expectedUserCollateral.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserCollateral, actualUserCollateral);
    });
  });

  describe('User base events', async () => {
    it('UserSupplyBaseEvent (supply, repay) -> UserWithdrawBaseEvent (withdraw, borrow)', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const userAddress = ALICE_ADDRESS;

      // We first need to initialize a mock user entity
      const mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: userAddress },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT,
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      let updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      // Creating a mock user supply base event
      const mockUserSupplyBaseEvent = Market.UserSupplyBaseEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: userAddress },
        },
        supply_amount: BigInt(66),
        repay_amount: BigInt(33),
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.UserSupplyBaseEvent.processEvent({
        event: mockUserSupplyBaseEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created (supply)
      const expectedBaseEventSupply: UserBaseEvent = {
        id: `${mockUserSupplyBaseEvent.transaction.id}_${mockUserSupplyBaseEvent.logIndex}_2`,
        actionType: 'Supply',
        amount: BigInt(66),
        timestamp: mockUserSupplyBaseEvent.block.time,
        user_id: userAddress,
      };

      // Getting the entity from the mock database
      const actualBaseEventSupply = updatedMockDb.entities.UserBaseEvent.get(
        expectedBaseEventSupply.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBaseEventSupply, actualBaseEventSupply);

      // Expected entity that should be created (repay)
      const expectedBaseEventRepay: UserBaseEvent = {
        id: `${mockUserSupplyBaseEvent.transaction.id}_${mockUserSupplyBaseEvent.logIndex}_1`,
        actionType: 'Repay',
        amount: BigInt(33),
        timestamp: mockUserSupplyBaseEvent.block.time,
        user_id: userAddress,
      };

      // Getting the entity from the mock database
      const actualBaseEventRepay = updatedMockDb.entities.UserBaseEvent.get(
        expectedBaseEventRepay.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBaseEventRepay, actualBaseEventRepay);

      // Create a mock user withdraw base event
      const mockUserWithdrawBaseEvent = Market.UserWithdrawBaseEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: userAddress },
        },
        withdraw_amount: BigInt(55),
        borrow_amount: BigInt(44),
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.UserWithdrawBaseEvent.processEvent({
        event: mockUserWithdrawBaseEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created (withdraw)
      const expectedBaseEventWithdraw: UserBaseEvent = {
        id: `${mockUserWithdrawBaseEvent.transaction.id}_${mockUserWithdrawBaseEvent.logIndex}_1`,
        actionType: 'Withdraw',
        amount: BigInt(55),
        timestamp: mockUserWithdrawBaseEvent.block.time,
        user_id: userAddress,
      };

      // Getting the entity from the mock database
      const actualBaseEventWithdraw = updatedMockDb.entities.UserBaseEvent.get(
        expectedBaseEventWithdraw.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBaseEventWithdraw, actualBaseEventWithdraw);

      // Expected entity that should be created (borrow)
      const expectedBaseEventBorrow: UserBaseEvent = {
        id: `${mockUserWithdrawBaseEvent.transaction.id}_${mockUserWithdrawBaseEvent.logIndex}_2`,
        actionType: 'Borrow',
        amount: BigInt(44),
        timestamp: mockUserWithdrawBaseEvent.block.time,
        user_id: userAddress,
      };

      // Getting the entity from the mock database
      const actualBaseEventBorrow = updatedMockDb.entities.UserBaseEvent.get(
        expectedBaseEventBorrow.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBaseEventBorrow, actualBaseEventBorrow);
    });
  });

  describe('Liquidation event', async () => {
    it('Create a LiquidationEvent entity and updates user entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const liquidator = ALICE_ADDRESS;
      const liquidated = BOB_ADDRESS;

      // We first need to initialize the liquidator and liquidated user entities
      let mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: liquidator },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT,
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      let updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: liquidated },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT,
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: updatedMockDb,
      });

      // Create a mock liquidate event
      const mockLiquidationEvent = Market.UserLiquidatedEvent.mockData({
        liquidator: {
          case: 'Address',
          payload: { bits: liquidator },
        },
        account: {
          case: 'Address',
          payload: { bits: liquidated },
        },
        base_paid_out: BigInt(111),
        base_paid_out_value: BigInt(111),
        total_base: BigInt(222),
        total_base_value: BigInt(222),
        decimals: 1,
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.UserLiquidatedEvent.processEvent({
        event: mockLiquidationEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      const expectedLiquidationEvent: LiquidationEvent = {
        id: `${mockLiquidationEvent.transaction.id}_${mockLiquidationEvent.logIndex}`,
        liquidator_id: liquidator,
        liquidated_id: liquidated,
        basePaidOut: BigInt(111),
        basePaidOutValue: BigInt(111),
        totalBase: BigInt(222),
        totalBaseValue: BigInt(222),
        decimals: 1,
        timestamp: mockLiquidationEvent.block.time,
      };

      // Getting the entity from the mock database
      const actualLiquidationEvent =
        updatedMockDb.entities.LiquidationEvent.get(
          expectedLiquidationEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedLiquidationEvent, actualLiquidationEvent);

      // Liquidator entity should also be updated
      const expectedLiquidatorEntity: User = {
        id: liquidator,
        address: liquidator,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(0),
        totalValueLiquidated: BigInt(222),
      };

      const actualLiquidatorEntity =
        updatedMockDb.entities.User.get(liquidator);

      assert.deepEqual(expectedLiquidatorEntity, actualLiquidatorEntity);
    });
  });

  describe('Absorb collateral event', async () => {
    it('Create an AbsorbCollateralEvent entity and updates UserCollateral entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // We first need to initialize a mock user entity
      const mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT,
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      let updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      // Create a mock user supply collateral event
      const mockUserSupplyCollateralEvent =
        Market.UserSupplyCollateralEvent.mockData({
          account: {
            case: 'Address',
            payload: { bits: address },
          },
          asset_id: { bits: TEST_ASSET_ID },
          amount: BigInt(100),
        });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.UserSupplyCollateralEvent.processEvent({
        event: mockUserSupplyCollateralEvent,
        mockDb: mockDbInitial,
      });

      const mockAbsorbCollateralEvent = Market.AbsorbCollateralEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        asset_id: { bits: TEST_ASSET_ID },
        amount: BigInt(100),
        seize_value: BigInt(333),
        decimals: 3,
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.AbsorbCollateralEvent.processEvent({
        event: mockAbsorbCollateralEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      const expectedAbsorbCollateralEvent: AbsorbCollateralEvent = {
        id: `${mockAbsorbCollateralEvent.transaction.id}_${mockAbsorbCollateralEvent.logIndex}`,
        user_id: address,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(100),
        seizeValue: BigInt(333),
        decimals: 3,
        timestamp: mockAbsorbCollateralEvent.block.time,
      };

      // Getting the entity from the mock database
      const actualAbsorbCollateralEvent =
        updatedMockDb.entities.AbsorbCollateralEvent.get(
          expectedAbsorbCollateralEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(
        expectedAbsorbCollateralEvent,
        actualAbsorbCollateralEvent
      );

      // User collateral entity should also be updated
      const expectedUserCollateralEntity: UserCollateral = {
        id: `${address}-${TEST_ASSET_ID}`,
        user_id: address,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(0),
      };

      // Should also update the corresponding UserCollateral entity
      const actualUserCollateralEntity =
        updatedMockDb.entities.UserCollateral.get(
          expectedUserCollateralEntity.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(
        expectedUserCollateralEntity,
        actualUserCollateralEntity
      );
    });
  });

  describe('Buy collateral event', async () => {
    it('Create a BuyCollateralEvent entity and a user entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // Create a mock buy collateral event
      const mockBuyCollateralEvent = Market.BuyCollateralEvent.mockData({
        caller: {
          case: 'Address',
          payload: { bits: address },
        },
        recipient: {
          case: 'Address',
          payload: { bits: address },
        },
        asset_id: { bits: TEST_ASSET_ID },
        amount: BigInt(100),
        price: BigInt(333),
      });

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.BuyCollateralEvent.processEvent({
        event: mockBuyCollateralEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedBuyCollateralEvent: BuyCollateralEvent = {
        id: `${mockBuyCollateralEvent.transaction.id}_${mockBuyCollateralEvent.logIndex}`,
        user_id: address,
        recipient: address,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(100),
        price: BigInt(333),
        timestamp: mockBuyCollateralEvent.block.time,
      };

      // Getting the entity from the mock database
      const actualBuyCollateralEvent =
        updatedMockDb.entities.BuyCollateralEvent.get(
          expectedBuyCollateralEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBuyCollateralEvent, actualBuyCollateralEvent);

      // Should also update the corresponding User entity
      const expectedUserEntity: User = {
        id: address,
        address: address,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(333),
        totalValueLiquidated: BigInt(0),
      };

      const actualUserEntity = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserEntity, actualUserEntity);
    });

    it('Create a BuyCollateralEvent entity and updates the user entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // We first need to initialize a mock user entity
      const mockUserBasicEvent = Market.UserBasicEvent.mockData({
        account: {
          case: 'Address',
          payload: { bits: address },
        },
        user_basic: {
          principal: {
            underlying: I256_INDENT,
          },
          base_tracking_index: BigInt(0),
          base_tracking_accrued: BigInt(0),
        },
      });

      let updatedMockDb = await Market.UserBasicEvent.processEvent({
        event: mockUserBasicEvent,
        mockDb: mockDbInitial,
      });

      // Create a mock buy collateral event
      let mockBuyCollateralEvent = Market.BuyCollateralEvent.mockData({
        caller: {
          case: 'Address',
          payload: { bits: address },
        },
        recipient: {
          case: 'Address',
          payload: { bits: address },
        },
        asset_id: { bits: TEST_ASSET_ID },
        amount: BigInt(100),
        price: BigInt(333),
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.BuyCollateralEvent.processEvent({
        event: mockBuyCollateralEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      let expectedBuyCollateralEvent: BuyCollateralEvent = {
        id: `${mockBuyCollateralEvent.transaction.id}_${mockBuyCollateralEvent.logIndex}`,
        user_id: address,
        recipient: address,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(100),
        price: BigInt(333),
        timestamp: mockBuyCollateralEvent.block.time,
      };

      // Getting the entity from the mock database
      let actualBuyCollateralEvent =
        updatedMockDb.entities.BuyCollateralEvent.get(
          expectedBuyCollateralEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBuyCollateralEvent, actualBuyCollateralEvent);

      // Should also update the corresponding User entity
      let expectedUserEntity: User = {
        id: address,
        address: address,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(333),
        totalValueLiquidated: BigInt(0),
      };

      let actualUserEntity = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserEntity, actualUserEntity);

      // Create another mock buy collateral event
      mockBuyCollateralEvent = Market.BuyCollateralEvent.mockData({
        caller: {
          case: 'Address',
          payload: { bits: address },
        },
        recipient: {
          case: 'Address',
          payload: { bits: address },
        },
        asset_id: { bits: TEST_ASSET_ID },
        amount: BigInt(111),
        price: BigInt(444),
      });

      // Processing the mock event on the mock database
      updatedMockDb = await Market.BuyCollateralEvent.processEvent({
        event: mockBuyCollateralEvent,
        mockDb: updatedMockDb,
      });

      // Expected entity that should be created
      expectedBuyCollateralEvent = {
        id: `${mockBuyCollateralEvent.transaction.id}_${mockBuyCollateralEvent.logIndex}`,
        user_id: address,
        recipient: address,
        collateralAsset_id: TEST_ASSET_ID,
        amount: BigInt(111),
        price: BigInt(444),
        timestamp: mockBuyCollateralEvent.block.time,
      };

      // Getting the entity from the mock database
      actualBuyCollateralEvent = updatedMockDb.entities.BuyCollateralEvent.get(
        expectedBuyCollateralEvent.id
      );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedBuyCollateralEvent, actualBuyCollateralEvent);

      // Should also update the corresponding User entity
      expectedUserEntity = {
        id: address,
        address: address,
        principal: BigInt(0),
        baseTrackingIndex: BigInt(0),
        baseTrackingAccrued: BigInt(0),

        totalCollateralBought: BigInt(777),
        totalValueLiquidated: BigInt(0),
      };

      // Getting the entity from the mock database
      actualUserEntity = updatedMockDb.entities.User.get(address);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(expectedUserEntity, actualUserEntity);
    });
  });

  describe('Reserves withdrawn event', async () => {
    it('Create a ReservesWithdrawnEvent entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      const address = ALICE_ADDRESS;

      // Create a mock reserves withdrawn event
      const mockReservesWithdrawnEvent = Market.ReservesWithdrawnEvent.mockData(
        {
          caller: {
            case: 'Address',
            payload: { bits: address },
          },
          to: {
            case: 'Address',
            payload: { bits: address },
          },
          amount: BigInt(100),
        }
      );

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.ReservesWithdrawnEvent.processEvent({
        event: mockReservesWithdrawnEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedReservesWithdrawnEvent: ReservesWithdrawnEvent = {
        id: `${mockReservesWithdrawnEvent.transaction.id}_${mockReservesWithdrawnEvent.logIndex}`,
        recipient: address,
        caller: address,
        amount: BigInt(100),
        timestamp: mockReservesWithdrawnEvent.block.time,
      };

      // Getting the entity from the mock database
      const actualReservesWithdrawnEvent =
        updatedMockDb.entities.ReservesWithdrawnEvent.get(
          expectedReservesWithdrawnEvent.id
        );

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(
        expectedReservesWithdrawnEvent,
        actualReservesWithdrawnEvent
      );
    });
  });

  describe('Pause configuration event', async () => {
    it('Create a PauseConfigurationEvent entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      // Create a mock pause configuration event
      const mockPauseConfigurationEvent =
        Market.PauseConfigurationEvent.mockData({
          pause_config: {
            supply_paused: true,
            withdraw_paused: false,
            absorb_paused: true,
            buy_paused: false,
          },
        });

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.PauseConfigurationEvent.processEvent({
        event: mockPauseConfigurationEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedPauseConfigurationEvent: PauseConfiguration = {
        id: PUASE_CONFIGURATION_ID,
        supplyPaused: true,
        withdrawPaused: false,
        absorbPaused: true,
        buyPaused: false,
      };

      // Getting the entity from the mock database
      const actualPauseConfigurationEvent =
        updatedMockDb.entities.PauseConfiguration.get(PUASE_CONFIGURATION_ID);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(
        expectedPauseConfigurationEvent,
        actualPauseConfigurationEvent
      );
    });
  });

  describe('Market configuration event', async () => {
    it('Create a MarketConfigurationEvent entity', async () => {
      // Initializing the mock database
      const mockDbInitial = MockDb.createMockDb();

      // Create a mock market configuration event
      const mockMarketConfigurationEvent =
        Market.MarketConfigurationEvent.mockData({
          market_config: {
            base_token_decimals: 6,
            base_token: { bits: TEST_ASSET_ID },
            base_token_price_feed_id: TEST_PRICE_FEED_ID,
            supply_kink: BigInt('850000000000000000'),
            borrow_kink: BigInt('850000000000000000'),
            supply_per_second_interest_rate_slope_low: BigInt(1141552511),
            supply_per_second_interest_rate_slope_high: BigInt(50735667174),
            supply_per_second_interest_rate_base: BigInt(0),
            borrow_per_second_interest_rate_slope_low: BigInt(1585489599),
            borrow_per_second_interest_rate_slope_high: BigInt(57077625570),
            borrow_per_second_interest_rate_base: BigInt(475646879),
            store_front_price_factor: BigInt('600000000000000000'),
            base_tracking_index_scale: BigInt(1000000000000000),
            base_tracking_supply_speed: BigInt(0),
            base_tracking_borrow_speed: BigInt(0),
            base_min_for_rewards: BigInt(1000000000),
            base_borrow_min: BigInt(1000),
            target_reserves: BigInt(1000000000000),
          },
        });

      // Processing the mock event on the mock database
      const updatedMockDb = await Market.MarketConfigurationEvent.processEvent({
        event: mockMarketConfigurationEvent,
        mockDb: mockDbInitial,
      });

      // Expected entity that should be created
      const expectedMarketConfigurationEvent: MarketConfiguartion = {
        id: MARKET_CONFIGURATION_ID,
        baseToken: TEST_ASSET_ID,
        baseTokenDecimals: 6,
        baseTokenPriceFeedId: TEST_PRICE_FEED_ID,
        supplyKink: BigInt('850000000000000000'),
        borrowKink: BigInt('850000000000000000'),
        supplyPerSecondInterestRateSlopeLow: BigInt(1141552511),
        supplyPerSecondInterestRateSlopeHigh: BigInt(50735667174),
        supplyPerSecondInterestRateBase: BigInt(0),
        borrowPerSecondInterestRateSlopeLow: BigInt(1585489599),
        borrowPerSecondInterestRateSlopeHigh: BigInt(57077625570),
        borrowPerSecondInterestRateBase: BigInt(475646879),
        storeFrontPriceFactor: BigInt('600000000000000000'),
        baseTrackingIndexScale: BigInt(1000000000000000),
        baseTrackingSupplySpeed: BigInt(0),
        baseTrackingBorrowSpeed: BigInt(0),
        baseMinForRewards: BigInt(1000000000),
        baseBorrowMin: BigInt(1000),
        targetReserves: BigInt(1000000000000),
      };

      // Getting the entity from the mock database
      const actualMarketConfigurationEvent =
        updatedMockDb.entities.MarketConfiguartion.get(MARKET_CONFIGURATION_ID);

      // Asserting that the entity in the mock database is the same as the expected entity
      assert.deepEqual(
        expectedMarketConfigurationEvent,
        actualMarketConfigurationEvent
      );
    });
  });
});
