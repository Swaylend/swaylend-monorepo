/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query GetCollateralAssets($account: String) {\n  User(where: {address: {_eq: $account}}) {\n    collateralAssets {\n      amount\n      collateralAsset_id\n    }\n  }\n}": types.GetCollateralAssetsDocument,
    "query GetCollateralConfigurations {\n  CollateralAsset {\n    supplyCap\n    priceFeedId\n    id\n    paused\n    liquidationPenalty\n    liquidateCollateralFactor\n    decimals\n    borrowCollateralFactor\n  }\n}": types.GetCollateralConfigurationsDocument,
    "query GetMarketConfiguration {\n  MarketConfiguartion {\n    baseToken\n    baseTokenDecimals\n    baseTokenPriceFeedId\n    baseBorrowMin\n    supplyKink\n    borrowKink\n    borrowPerSecondInterestRateBase\n    borrowPerSecondInterestRateSlopeLow\n    borrowPerSecondInterestRateSlopeHigh\n  }\n}": types.GetMarketConfigurationDocument,
    "query GetMarketState {\n  MarketState {\n    totalBorrowBase\n    totalSupplyBase\n  }\n}": types.GetMarketStateDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCollateralAssets($account: String) {\n  User(where: {address: {_eq: $account}}) {\n    collateralAssets {\n      amount\n      collateralAsset_id\n    }\n  }\n}"): typeof import('./graphql').GetCollateralAssetsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCollateralConfigurations {\n  CollateralAsset {\n    supplyCap\n    priceFeedId\n    id\n    paused\n    liquidationPenalty\n    liquidateCollateralFactor\n    decimals\n    borrowCollateralFactor\n  }\n}"): typeof import('./graphql').GetCollateralConfigurationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMarketConfiguration {\n  MarketConfiguartion {\n    baseToken\n    baseTokenDecimals\n    baseTokenPriceFeedId\n    baseBorrowMin\n    supplyKink\n    borrowKink\n    borrowPerSecondInterestRateBase\n    borrowPerSecondInterestRateSlopeLow\n    borrowPerSecondInterestRateSlopeHigh\n  }\n}"): typeof import('./graphql').GetMarketConfigurationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMarketState {\n  MarketState {\n    totalBorrowBase\n    totalSupplyBase\n  }\n}"): typeof import('./graphql').GetMarketStateDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
