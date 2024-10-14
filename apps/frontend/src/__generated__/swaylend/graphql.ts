/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  baseactiontype: { input: any; output: any; }
  collateralactiontype: { input: any; output: any; }
  contract_type: { input: any; output: any; }
  entity_type: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  numeric: { input: any; output: any; }
  timestamp: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
};

/** order by aggregate values of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Aggregate_Order_By = {
  avg?: InputMaybe<AbsorbCollateralEvent_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<AbsorbCollateralEvent_Max_Order_By>;
  min?: InputMaybe<AbsorbCollateralEvent_Min_Order_By>;
  stddev?: InputMaybe<AbsorbCollateralEvent_Stddev_Order_By>;
  stddev_pop?: InputMaybe<AbsorbCollateralEvent_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<AbsorbCollateralEvent_Stddev_Samp_Order_By>;
  sum?: InputMaybe<AbsorbCollateralEvent_Sum_Order_By>;
  var_pop?: InputMaybe<AbsorbCollateralEvent_Var_Pop_Order_By>;
  var_samp?: InputMaybe<AbsorbCollateralEvent_Var_Samp_Order_By>;
  variance?: InputMaybe<AbsorbCollateralEvent_Variance_Order_By>;
};

/** order by avg() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "AbsorbCollateralEvent". All fields are combined with a logical 'AND'. */
export type AbsorbCollateralEvent_Bool_Exp = {
  _and?: InputMaybe<Array<AbsorbCollateralEvent_Bool_Exp>>;
  _not?: InputMaybe<AbsorbCollateralEvent_Bool_Exp>;
  _or?: InputMaybe<Array<AbsorbCollateralEvent_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  collateralAsset?: InputMaybe<CollateralAsset_Bool_Exp>;
  collateralAsset_id?: InputMaybe<String_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  decimals?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  seizeValue?: InputMaybe<Numeric_Comparison_Exp>;
  timestamp?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "AbsorbCollateralEvent". */
export type AbsorbCollateralEvent_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset?: InputMaybe<CollateralAsset_Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "AbsorbCollateralEvent" */
export enum AbsorbCollateralEvent_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  CollateralAssetId = 'collateralAsset_id',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Decimals = 'decimals',
  /** column name */
  Id = 'id',
  /** column name */
  SeizeValue = 'seizeValue',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: AbsorbCollateralEvent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type AbsorbCollateralEvent_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  collateralAsset_id?: InputMaybe<Scalars['String']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  seizeValue?: InputMaybe<Scalars['numeric']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "AbsorbCollateralEvent" */
export type AbsorbCollateralEvent_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  seizeValue?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** order by aggregate values of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Aggregate_Order_By = {
  avg?: InputMaybe<BuyCollateralEvent_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<BuyCollateralEvent_Max_Order_By>;
  min?: InputMaybe<BuyCollateralEvent_Min_Order_By>;
  stddev?: InputMaybe<BuyCollateralEvent_Stddev_Order_By>;
  stddev_pop?: InputMaybe<BuyCollateralEvent_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<BuyCollateralEvent_Stddev_Samp_Order_By>;
  sum?: InputMaybe<BuyCollateralEvent_Sum_Order_By>;
  var_pop?: InputMaybe<BuyCollateralEvent_Var_Pop_Order_By>;
  var_samp?: InputMaybe<BuyCollateralEvent_Var_Samp_Order_By>;
  variance?: InputMaybe<BuyCollateralEvent_Variance_Order_By>;
};

/** order by avg() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "BuyCollateralEvent". All fields are combined with a logical 'AND'. */
export type BuyCollateralEvent_Bool_Exp = {
  _and?: InputMaybe<Array<BuyCollateralEvent_Bool_Exp>>;
  _not?: InputMaybe<BuyCollateralEvent_Bool_Exp>;
  _or?: InputMaybe<Array<BuyCollateralEvent_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  collateralAsset?: InputMaybe<CollateralAsset_Bool_Exp>;
  collateralAsset_id?: InputMaybe<String_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  price?: InputMaybe<Numeric_Comparison_Exp>;
  recipient?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  recipient?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  recipient?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "BuyCollateralEvent". */
export type BuyCollateralEvent_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset?: InputMaybe<CollateralAsset_Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  recipient?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "BuyCollateralEvent" */
export enum BuyCollateralEvent_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  CollateralAssetId = 'collateralAsset_id',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  Price = 'price',
  /** column name */
  Recipient = 'recipient',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "BuyCollateralEvent" */
export type BuyCollateralEvent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: BuyCollateralEvent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type BuyCollateralEvent_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  collateralAsset_id?: InputMaybe<Scalars['String']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['numeric']['input']>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "BuyCollateralEvent" */
export type BuyCollateralEvent_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "CollateralAsset". All fields are combined with a logical 'AND'. */
export type CollateralAsset_Bool_Exp = {
  _and?: InputMaybe<Array<CollateralAsset_Bool_Exp>>;
  _not?: InputMaybe<CollateralAsset_Bool_Exp>;
  _or?: InputMaybe<Array<CollateralAsset_Bool_Exp>>;
  borrowCollateralFactor?: InputMaybe<Numeric_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  decimals?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  liquidateCollateralFactor?: InputMaybe<Numeric_Comparison_Exp>;
  liquidationPenalty?: InputMaybe<Numeric_Comparison_Exp>;
  paused?: InputMaybe<Boolean_Comparison_Exp>;
  priceFeedId?: InputMaybe<String_Comparison_Exp>;
  supplyCap?: InputMaybe<Numeric_Comparison_Exp>;
  users?: InputMaybe<UserCollateral_Bool_Exp>;
};

/** Ordering options when selecting data from "CollateralAsset". */
export type CollateralAsset_Order_By = {
  borrowCollateralFactor?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liquidateCollateralFactor?: InputMaybe<Order_By>;
  liquidationPenalty?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
  priceFeedId?: InputMaybe<Order_By>;
  supplyCap?: InputMaybe<Order_By>;
  users_aggregate?: InputMaybe<UserCollateral_Aggregate_Order_By>;
};

/** select columns of table "CollateralAsset" */
export enum CollateralAsset_Select_Column {
  /** column name */
  BorrowCollateralFactor = 'borrowCollateralFactor',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Decimals = 'decimals',
  /** column name */
  Id = 'id',
  /** column name */
  LiquidateCollateralFactor = 'liquidateCollateralFactor',
  /** column name */
  LiquidationPenalty = 'liquidationPenalty',
  /** column name */
  Paused = 'paused',
  /** column name */
  PriceFeedId = 'priceFeedId',
  /** column name */
  SupplyCap = 'supplyCap'
}

/** Streaming cursor of the table "CollateralAsset" */
export type CollateralAsset_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: CollateralAsset_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type CollateralAsset_Stream_Cursor_Value_Input = {
  borrowCollateralFactor?: InputMaybe<Scalars['numeric']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  liquidateCollateralFactor?: InputMaybe<Scalars['numeric']['input']>;
  liquidationPenalty?: InputMaybe<Scalars['numeric']['input']>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  priceFeedId?: InputMaybe<Scalars['String']['input']>;
  supplyCap?: InputMaybe<Scalars['numeric']['input']>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** order by aggregate values of table "LiquidationEvent" */
export type LiquidationEvent_Aggregate_Order_By = {
  avg?: InputMaybe<LiquidationEvent_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<LiquidationEvent_Max_Order_By>;
  min?: InputMaybe<LiquidationEvent_Min_Order_By>;
  stddev?: InputMaybe<LiquidationEvent_Stddev_Order_By>;
  stddev_pop?: InputMaybe<LiquidationEvent_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<LiquidationEvent_Stddev_Samp_Order_By>;
  sum?: InputMaybe<LiquidationEvent_Sum_Order_By>;
  var_pop?: InputMaybe<LiquidationEvent_Var_Pop_Order_By>;
  var_samp?: InputMaybe<LiquidationEvent_Var_Samp_Order_By>;
  variance?: InputMaybe<LiquidationEvent_Variance_Order_By>;
};

/** order by avg() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Avg_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "LiquidationEvent". All fields are combined with a logical 'AND'. */
export type LiquidationEvent_Bool_Exp = {
  _and?: InputMaybe<Array<LiquidationEvent_Bool_Exp>>;
  _not?: InputMaybe<LiquidationEvent_Bool_Exp>;
  _or?: InputMaybe<Array<LiquidationEvent_Bool_Exp>>;
  basePaidOut?: InputMaybe<Numeric_Comparison_Exp>;
  basePaidOutValue?: InputMaybe<Numeric_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  decimals?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  liquidated?: InputMaybe<User_Bool_Exp>;
  liquidated_id?: InputMaybe<String_Comparison_Exp>;
  liquidator?: InputMaybe<User_Bool_Exp>;
  liquidator_id?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Int_Comparison_Exp>;
  totalBase?: InputMaybe<Numeric_Comparison_Exp>;
  totalBaseValue?: InputMaybe<Numeric_Comparison_Exp>;
};

/** order by max() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Max_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liquidated_id?: InputMaybe<Order_By>;
  liquidator_id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Min_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liquidated_id?: InputMaybe<Order_By>;
  liquidator_id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "LiquidationEvent". */
export type LiquidationEvent_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liquidated?: InputMaybe<User_Order_By>;
  liquidated_id?: InputMaybe<Order_By>;
  liquidator?: InputMaybe<User_Order_By>;
  liquidator_id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** select columns of table "LiquidationEvent" */
export enum LiquidationEvent_Select_Column {
  /** column name */
  BasePaidOut = 'basePaidOut',
  /** column name */
  BasePaidOutValue = 'basePaidOutValue',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Decimals = 'decimals',
  /** column name */
  Id = 'id',
  /** column name */
  LiquidatedId = 'liquidated_id',
  /** column name */
  LiquidatorId = 'liquidator_id',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  TotalBase = 'totalBase',
  /** column name */
  TotalBaseValue = 'totalBaseValue'
}

/** order by stddev() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Stddev_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Stddev_Pop_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Stddev_Samp_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "LiquidationEvent" */
export type LiquidationEvent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: LiquidationEvent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type LiquidationEvent_Stream_Cursor_Value_Input = {
  basePaidOut?: InputMaybe<Scalars['numeric']['input']>;
  basePaidOutValue?: InputMaybe<Scalars['numeric']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  liquidated_id?: InputMaybe<Scalars['String']['input']>;
  liquidator_id?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  totalBase?: InputMaybe<Scalars['numeric']['input']>;
  totalBaseValue?: InputMaybe<Scalars['numeric']['input']>;
};

/** order by sum() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Sum_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Var_Pop_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Var_Samp_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "LiquidationEvent" */
export type LiquidationEvent_Variance_Order_By = {
  basePaidOut?: InputMaybe<Order_By>;
  basePaidOutValue?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  totalBase?: InputMaybe<Order_By>;
  totalBaseValue?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "MarketConfiguartion". All fields are combined with a logical 'AND'. */
export type MarketConfiguartion_Bool_Exp = {
  _and?: InputMaybe<Array<MarketConfiguartion_Bool_Exp>>;
  _not?: InputMaybe<MarketConfiguartion_Bool_Exp>;
  _or?: InputMaybe<Array<MarketConfiguartion_Bool_Exp>>;
  baseBorrowMin?: InputMaybe<Numeric_Comparison_Exp>;
  baseMinForRewards?: InputMaybe<Numeric_Comparison_Exp>;
  baseToken?: InputMaybe<String_Comparison_Exp>;
  baseTokenDecimals?: InputMaybe<Int_Comparison_Exp>;
  baseTokenPriceFeedId?: InputMaybe<String_Comparison_Exp>;
  baseTrackingBorrowSpeed?: InputMaybe<Numeric_Comparison_Exp>;
  baseTrackingIndexScale?: InputMaybe<Numeric_Comparison_Exp>;
  baseTrackingSupplySpeed?: InputMaybe<Numeric_Comparison_Exp>;
  borrowKink?: InputMaybe<Numeric_Comparison_Exp>;
  borrowPerSecondInterestRateBase?: InputMaybe<Numeric_Comparison_Exp>;
  borrowPerSecondInterestRateSlopeHigh?: InputMaybe<Numeric_Comparison_Exp>;
  borrowPerSecondInterestRateSlopeLow?: InputMaybe<Numeric_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  storeFrontPriceFactor?: InputMaybe<Numeric_Comparison_Exp>;
  supplyKink?: InputMaybe<Numeric_Comparison_Exp>;
  supplyPerSecondInterestRateBase?: InputMaybe<Numeric_Comparison_Exp>;
  supplyPerSecondInterestRateSlopeHigh?: InputMaybe<Numeric_Comparison_Exp>;
  supplyPerSecondInterestRateSlopeLow?: InputMaybe<Numeric_Comparison_Exp>;
  targetReserves?: InputMaybe<Numeric_Comparison_Exp>;
};

/** Ordering options when selecting data from "MarketConfiguartion". */
export type MarketConfiguartion_Order_By = {
  baseBorrowMin?: InputMaybe<Order_By>;
  baseMinForRewards?: InputMaybe<Order_By>;
  baseToken?: InputMaybe<Order_By>;
  baseTokenDecimals?: InputMaybe<Order_By>;
  baseTokenPriceFeedId?: InputMaybe<Order_By>;
  baseTrackingBorrowSpeed?: InputMaybe<Order_By>;
  baseTrackingIndexScale?: InputMaybe<Order_By>;
  baseTrackingSupplySpeed?: InputMaybe<Order_By>;
  borrowKink?: InputMaybe<Order_By>;
  borrowPerSecondInterestRateBase?: InputMaybe<Order_By>;
  borrowPerSecondInterestRateSlopeHigh?: InputMaybe<Order_By>;
  borrowPerSecondInterestRateSlopeLow?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  storeFrontPriceFactor?: InputMaybe<Order_By>;
  supplyKink?: InputMaybe<Order_By>;
  supplyPerSecondInterestRateBase?: InputMaybe<Order_By>;
  supplyPerSecondInterestRateSlopeHigh?: InputMaybe<Order_By>;
  supplyPerSecondInterestRateSlopeLow?: InputMaybe<Order_By>;
  targetReserves?: InputMaybe<Order_By>;
};

/** select columns of table "MarketConfiguartion" */
export enum MarketConfiguartion_Select_Column {
  /** column name */
  BaseBorrowMin = 'baseBorrowMin',
  /** column name */
  BaseMinForRewards = 'baseMinForRewards',
  /** column name */
  BaseToken = 'baseToken',
  /** column name */
  BaseTokenDecimals = 'baseTokenDecimals',
  /** column name */
  BaseTokenPriceFeedId = 'baseTokenPriceFeedId',
  /** column name */
  BaseTrackingBorrowSpeed = 'baseTrackingBorrowSpeed',
  /** column name */
  BaseTrackingIndexScale = 'baseTrackingIndexScale',
  /** column name */
  BaseTrackingSupplySpeed = 'baseTrackingSupplySpeed',
  /** column name */
  BorrowKink = 'borrowKink',
  /** column name */
  BorrowPerSecondInterestRateBase = 'borrowPerSecondInterestRateBase',
  /** column name */
  BorrowPerSecondInterestRateSlopeHigh = 'borrowPerSecondInterestRateSlopeHigh',
  /** column name */
  BorrowPerSecondInterestRateSlopeLow = 'borrowPerSecondInterestRateSlopeLow',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  StoreFrontPriceFactor = 'storeFrontPriceFactor',
  /** column name */
  SupplyKink = 'supplyKink',
  /** column name */
  SupplyPerSecondInterestRateBase = 'supplyPerSecondInterestRateBase',
  /** column name */
  SupplyPerSecondInterestRateSlopeHigh = 'supplyPerSecondInterestRateSlopeHigh',
  /** column name */
  SupplyPerSecondInterestRateSlopeLow = 'supplyPerSecondInterestRateSlopeLow',
  /** column name */
  TargetReserves = 'targetReserves'
}

/** Streaming cursor of the table "MarketConfiguartion" */
export type MarketConfiguartion_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: MarketConfiguartion_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type MarketConfiguartion_Stream_Cursor_Value_Input = {
  baseBorrowMin?: InputMaybe<Scalars['numeric']['input']>;
  baseMinForRewards?: InputMaybe<Scalars['numeric']['input']>;
  baseToken?: InputMaybe<Scalars['String']['input']>;
  baseTokenDecimals?: InputMaybe<Scalars['Int']['input']>;
  baseTokenPriceFeedId?: InputMaybe<Scalars['String']['input']>;
  baseTrackingBorrowSpeed?: InputMaybe<Scalars['numeric']['input']>;
  baseTrackingIndexScale?: InputMaybe<Scalars['numeric']['input']>;
  baseTrackingSupplySpeed?: InputMaybe<Scalars['numeric']['input']>;
  borrowKink?: InputMaybe<Scalars['numeric']['input']>;
  borrowPerSecondInterestRateBase?: InputMaybe<Scalars['numeric']['input']>;
  borrowPerSecondInterestRateSlopeHigh?: InputMaybe<Scalars['numeric']['input']>;
  borrowPerSecondInterestRateSlopeLow?: InputMaybe<Scalars['numeric']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  storeFrontPriceFactor?: InputMaybe<Scalars['numeric']['input']>;
  supplyKink?: InputMaybe<Scalars['numeric']['input']>;
  supplyPerSecondInterestRateBase?: InputMaybe<Scalars['numeric']['input']>;
  supplyPerSecondInterestRateSlopeHigh?: InputMaybe<Scalars['numeric']['input']>;
  supplyPerSecondInterestRateSlopeLow?: InputMaybe<Scalars['numeric']['input']>;
  targetReserves?: InputMaybe<Scalars['numeric']['input']>;
};

/** Boolean expression to filter rows from the table "MarketState". All fields are combined with a logical 'AND'. */
export type MarketState_Bool_Exp = {
  _and?: InputMaybe<Array<MarketState_Bool_Exp>>;
  _not?: InputMaybe<MarketState_Bool_Exp>;
  _or?: InputMaybe<Array<MarketState_Bool_Exp>>;
  baseBorrowIndex?: InputMaybe<Numeric_Comparison_Exp>;
  baseSupplyIndex?: InputMaybe<Numeric_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  lastAccrualTime?: InputMaybe<Numeric_Comparison_Exp>;
  totalBorrowBase?: InputMaybe<Numeric_Comparison_Exp>;
  totalSupplyBase?: InputMaybe<Numeric_Comparison_Exp>;
  trackingBorrowIndex?: InputMaybe<Numeric_Comparison_Exp>;
  trackingSupplyIndex?: InputMaybe<Numeric_Comparison_Exp>;
};

/** Ordering options when selecting data from "MarketState". */
export type MarketState_Order_By = {
  baseBorrowIndex?: InputMaybe<Order_By>;
  baseSupplyIndex?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lastAccrualTime?: InputMaybe<Order_By>;
  totalBorrowBase?: InputMaybe<Order_By>;
  totalSupplyBase?: InputMaybe<Order_By>;
  trackingBorrowIndex?: InputMaybe<Order_By>;
  trackingSupplyIndex?: InputMaybe<Order_By>;
};

/** select columns of table "MarketState" */
export enum MarketState_Select_Column {
  /** column name */
  BaseBorrowIndex = 'baseBorrowIndex',
  /** column name */
  BaseSupplyIndex = 'baseSupplyIndex',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  LastAccrualTime = 'lastAccrualTime',
  /** column name */
  TotalBorrowBase = 'totalBorrowBase',
  /** column name */
  TotalSupplyBase = 'totalSupplyBase',
  /** column name */
  TrackingBorrowIndex = 'trackingBorrowIndex',
  /** column name */
  TrackingSupplyIndex = 'trackingSupplyIndex'
}

/** Streaming cursor of the table "MarketState" */
export type MarketState_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: MarketState_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type MarketState_Stream_Cursor_Value_Input = {
  baseBorrowIndex?: InputMaybe<Scalars['numeric']['input']>;
  baseSupplyIndex?: InputMaybe<Scalars['numeric']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  lastAccrualTime?: InputMaybe<Scalars['numeric']['input']>;
  totalBorrowBase?: InputMaybe<Scalars['numeric']['input']>;
  totalSupplyBase?: InputMaybe<Scalars['numeric']['input']>;
  trackingBorrowIndex?: InputMaybe<Scalars['numeric']['input']>;
  trackingSupplyIndex?: InputMaybe<Scalars['numeric']['input']>;
};

/** Boolean expression to filter rows from the table "PauseConfiguration". All fields are combined with a logical 'AND'. */
export type PauseConfiguration_Bool_Exp = {
  _and?: InputMaybe<Array<PauseConfiguration_Bool_Exp>>;
  _not?: InputMaybe<PauseConfiguration_Bool_Exp>;
  _or?: InputMaybe<Array<PauseConfiguration_Bool_Exp>>;
  absorbPaused?: InputMaybe<Boolean_Comparison_Exp>;
  buyPaused?: InputMaybe<Boolean_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  supplyPaused?: InputMaybe<Boolean_Comparison_Exp>;
  withdrawPaused?: InputMaybe<Boolean_Comparison_Exp>;
};

/** Ordering options when selecting data from "PauseConfiguration". */
export type PauseConfiguration_Order_By = {
  absorbPaused?: InputMaybe<Order_By>;
  buyPaused?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  supplyPaused?: InputMaybe<Order_By>;
  withdrawPaused?: InputMaybe<Order_By>;
};

/** select columns of table "PauseConfiguration" */
export enum PauseConfiguration_Select_Column {
  /** column name */
  AbsorbPaused = 'absorbPaused',
  /** column name */
  BuyPaused = 'buyPaused',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  SupplyPaused = 'supplyPaused',
  /** column name */
  WithdrawPaused = 'withdrawPaused'
}

/** Streaming cursor of the table "PauseConfiguration" */
export type PauseConfiguration_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: PauseConfiguration_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type PauseConfiguration_Stream_Cursor_Value_Input = {
  absorbPaused?: InputMaybe<Scalars['Boolean']['input']>;
  buyPaused?: InputMaybe<Scalars['Boolean']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  supplyPaused?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawPaused?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "ReservesWithdrawnEvent". All fields are combined with a logical 'AND'. */
export type ReservesWithdrawnEvent_Bool_Exp = {
  _and?: InputMaybe<Array<ReservesWithdrawnEvent_Bool_Exp>>;
  _not?: InputMaybe<ReservesWithdrawnEvent_Bool_Exp>;
  _or?: InputMaybe<Array<ReservesWithdrawnEvent_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  caller?: InputMaybe<String_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  recipient?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Int_Comparison_Exp>;
};

/** Ordering options when selecting data from "ReservesWithdrawnEvent". */
export type ReservesWithdrawnEvent_Order_By = {
  amount?: InputMaybe<Order_By>;
  caller?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  recipient?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** select columns of table "ReservesWithdrawnEvent" */
export enum ReservesWithdrawnEvent_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  Caller = 'caller',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  Recipient = 'recipient',
  /** column name */
  Timestamp = 'timestamp'
}

/** Streaming cursor of the table "ReservesWithdrawnEvent" */
export type ReservesWithdrawnEvent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: ReservesWithdrawnEvent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type ReservesWithdrawnEvent_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  caller?: InputMaybe<Scalars['String']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** order by aggregate values of table "UserBaseEvent" */
export type UserBaseEvent_Aggregate_Order_By = {
  avg?: InputMaybe<UserBaseEvent_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<UserBaseEvent_Max_Order_By>;
  min?: InputMaybe<UserBaseEvent_Min_Order_By>;
  stddev?: InputMaybe<UserBaseEvent_Stddev_Order_By>;
  stddev_pop?: InputMaybe<UserBaseEvent_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<UserBaseEvent_Stddev_Samp_Order_By>;
  sum?: InputMaybe<UserBaseEvent_Sum_Order_By>;
  var_pop?: InputMaybe<UserBaseEvent_Var_Pop_Order_By>;
  var_samp?: InputMaybe<UserBaseEvent_Var_Samp_Order_By>;
  variance?: InputMaybe<UserBaseEvent_Variance_Order_By>;
};

/** order by avg() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "UserBaseEvent". All fields are combined with a logical 'AND'. */
export type UserBaseEvent_Bool_Exp = {
  _and?: InputMaybe<Array<UserBaseEvent_Bool_Exp>>;
  _not?: InputMaybe<UserBaseEvent_Bool_Exp>;
  _or?: InputMaybe<Array<UserBaseEvent_Bool_Exp>>;
  actionType?: InputMaybe<Baseactiontype_Comparison_Exp>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Max_Order_By = {
  actionType?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Min_Order_By = {
  actionType?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "UserBaseEvent". */
export type UserBaseEvent_Order_By = {
  actionType?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "UserBaseEvent" */
export enum UserBaseEvent_Select_Column {
  /** column name */
  ActionType = 'actionType',
  /** column name */
  Amount = 'amount',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "UserBaseEvent" */
export type UserBaseEvent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: UserBaseEvent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type UserBaseEvent_Stream_Cursor_Value_Input = {
  actionType?: InputMaybe<Scalars['baseactiontype']['input']>;
  amount?: InputMaybe<Scalars['numeric']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "UserBaseEvent" */
export type UserBaseEvent_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by aggregate values of table "UserCollateralEvent" */
export type UserCollateralEvent_Aggregate_Order_By = {
  avg?: InputMaybe<UserCollateralEvent_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<UserCollateralEvent_Max_Order_By>;
  min?: InputMaybe<UserCollateralEvent_Min_Order_By>;
  stddev?: InputMaybe<UserCollateralEvent_Stddev_Order_By>;
  stddev_pop?: InputMaybe<UserCollateralEvent_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<UserCollateralEvent_Stddev_Samp_Order_By>;
  sum?: InputMaybe<UserCollateralEvent_Sum_Order_By>;
  var_pop?: InputMaybe<UserCollateralEvent_Var_Pop_Order_By>;
  var_samp?: InputMaybe<UserCollateralEvent_Var_Samp_Order_By>;
  variance?: InputMaybe<UserCollateralEvent_Variance_Order_By>;
};

/** order by avg() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "UserCollateralEvent". All fields are combined with a logical 'AND'. */
export type UserCollateralEvent_Bool_Exp = {
  _and?: InputMaybe<Array<UserCollateralEvent_Bool_Exp>>;
  _not?: InputMaybe<UserCollateralEvent_Bool_Exp>;
  _or?: InputMaybe<Array<UserCollateralEvent_Bool_Exp>>;
  actionType?: InputMaybe<Collateralactiontype_Comparison_Exp>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  collateralAsset?: InputMaybe<CollateralAsset_Bool_Exp>;
  collateralAsset_id?: InputMaybe<String_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Max_Order_By = {
  actionType?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Min_Order_By = {
  actionType?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "UserCollateralEvent". */
export type UserCollateralEvent_Order_By = {
  actionType?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  collateralAsset?: InputMaybe<CollateralAsset_Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "UserCollateralEvent" */
export enum UserCollateralEvent_Select_Column {
  /** column name */
  ActionType = 'actionType',
  /** column name */
  Amount = 'amount',
  /** column name */
  CollateralAssetId = 'collateralAsset_id',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "UserCollateralEvent" */
export type UserCollateralEvent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: UserCollateralEvent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type UserCollateralEvent_Stream_Cursor_Value_Input = {
  actionType?: InputMaybe<Scalars['collateralactiontype']['input']>;
  amount?: InputMaybe<Scalars['numeric']['input']>;
  collateralAsset_id?: InputMaybe<Scalars['String']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "UserCollateralEvent" */
export type UserCollateralEvent_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
};

/** order by aggregate values of table "UserCollateral" */
export type UserCollateral_Aggregate_Order_By = {
  avg?: InputMaybe<UserCollateral_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<UserCollateral_Max_Order_By>;
  min?: InputMaybe<UserCollateral_Min_Order_By>;
  stddev?: InputMaybe<UserCollateral_Stddev_Order_By>;
  stddev_pop?: InputMaybe<UserCollateral_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<UserCollateral_Stddev_Samp_Order_By>;
  sum?: InputMaybe<UserCollateral_Sum_Order_By>;
  var_pop?: InputMaybe<UserCollateral_Var_Pop_Order_By>;
  var_samp?: InputMaybe<UserCollateral_Var_Samp_Order_By>;
  variance?: InputMaybe<UserCollateral_Variance_Order_By>;
};

/** order by avg() on columns of table "UserCollateral" */
export type UserCollateral_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "UserCollateral". All fields are combined with a logical 'AND'. */
export type UserCollateral_Bool_Exp = {
  _and?: InputMaybe<Array<UserCollateral_Bool_Exp>>;
  _not?: InputMaybe<UserCollateral_Bool_Exp>;
  _or?: InputMaybe<Array<UserCollateral_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  collateralAsset?: InputMaybe<CollateralAsset_Bool_Exp>;
  collateralAsset_id?: InputMaybe<String_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "UserCollateral" */
export type UserCollateral_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "UserCollateral" */
export type UserCollateral_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "UserCollateral". */
export type UserCollateral_Order_By = {
  amount?: InputMaybe<Order_By>;
  collateralAsset?: InputMaybe<CollateralAsset_Order_By>;
  collateralAsset_id?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "UserCollateral" */
export enum UserCollateral_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  CollateralAssetId = 'collateralAsset_id',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "UserCollateral" */
export type UserCollateral_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "UserCollateral" */
export type UserCollateral_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "UserCollateral" */
export type UserCollateral_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "UserCollateral" */
export type UserCollateral_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: UserCollateral_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type UserCollateral_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  collateralAsset_id?: InputMaybe<Scalars['String']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "UserCollateral" */
export type UserCollateral_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "UserCollateral" */
export type UserCollateral_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "UserCollateral" */
export type UserCollateral_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "UserCollateral" */
export type UserCollateral_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "User". All fields are combined with a logical 'AND'. */
export type User_Bool_Exp = {
  _and?: InputMaybe<Array<User_Bool_Exp>>;
  _not?: InputMaybe<User_Bool_Exp>;
  _or?: InputMaybe<Array<User_Bool_Exp>>;
  absorbCollateralEvents?: InputMaybe<AbsorbCollateralEvent_Bool_Exp>;
  address?: InputMaybe<String_Comparison_Exp>;
  baseEvents?: InputMaybe<UserBaseEvent_Bool_Exp>;
  baseTrackingAccrued?: InputMaybe<Numeric_Comparison_Exp>;
  baseTrackingIndex?: InputMaybe<Numeric_Comparison_Exp>;
  buyCollateralEvents?: InputMaybe<BuyCollateralEvent_Bool_Exp>;
  collateralAssets?: InputMaybe<UserCollateral_Bool_Exp>;
  collateralEvents?: InputMaybe<UserCollateralEvent_Bool_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  liquidationEventsLiquidated?: InputMaybe<LiquidationEvent_Bool_Exp>;
  liquidationEventsLiquidator?: InputMaybe<LiquidationEvent_Bool_Exp>;
  principal?: InputMaybe<Numeric_Comparison_Exp>;
  totalCollateralBought?: InputMaybe<Numeric_Comparison_Exp>;
  totalValueLiquidated?: InputMaybe<Numeric_Comparison_Exp>;
};

/** Ordering options when selecting data from "User". */
export type User_Order_By = {
  absorbCollateralEvents_aggregate?: InputMaybe<AbsorbCollateralEvent_Aggregate_Order_By>;
  address?: InputMaybe<Order_By>;
  baseEvents_aggregate?: InputMaybe<UserBaseEvent_Aggregate_Order_By>;
  baseTrackingAccrued?: InputMaybe<Order_By>;
  baseTrackingIndex?: InputMaybe<Order_By>;
  buyCollateralEvents_aggregate?: InputMaybe<BuyCollateralEvent_Aggregate_Order_By>;
  collateralAssets_aggregate?: InputMaybe<UserCollateral_Aggregate_Order_By>;
  collateralEvents_aggregate?: InputMaybe<UserCollateralEvent_Aggregate_Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liquidationEventsLiquidated_aggregate?: InputMaybe<LiquidationEvent_Aggregate_Order_By>;
  liquidationEventsLiquidator_aggregate?: InputMaybe<LiquidationEvent_Aggregate_Order_By>;
  principal?: InputMaybe<Order_By>;
  totalCollateralBought?: InputMaybe<Order_By>;
  totalValueLiquidated?: InputMaybe<Order_By>;
};

/** select columns of table "User" */
export enum User_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  BaseTrackingAccrued = 'baseTrackingAccrued',
  /** column name */
  BaseTrackingIndex = 'baseTrackingIndex',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  Id = 'id',
  /** column name */
  Principal = 'principal',
  /** column name */
  TotalCollateralBought = 'totalCollateralBought',
  /** column name */
  TotalValueLiquidated = 'totalValueLiquidated'
}

/** Streaming cursor of the table "User" */
export type User_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  baseTrackingAccrued?: InputMaybe<Scalars['numeric']['input']>;
  baseTrackingIndex?: InputMaybe<Scalars['numeric']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  principal?: InputMaybe<Scalars['numeric']['input']>;
  totalCollateralBought?: InputMaybe<Scalars['numeric']['input']>;
  totalValueLiquidated?: InputMaybe<Scalars['numeric']['input']>;
};

/** Boolean expression to compare columns of type "baseactiontype". All fields are combined with logical 'AND'. */
export type Baseactiontype_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['baseactiontype']['input']>;
  _gt?: InputMaybe<Scalars['baseactiontype']['input']>;
  _gte?: InputMaybe<Scalars['baseactiontype']['input']>;
  _in?: InputMaybe<Array<Scalars['baseactiontype']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['baseactiontype']['input']>;
  _lte?: InputMaybe<Scalars['baseactiontype']['input']>;
  _neq?: InputMaybe<Scalars['baseactiontype']['input']>;
  _nin?: InputMaybe<Array<Scalars['baseactiontype']['input']>>;
};

/** Boolean expression to filter rows from the table "chain_metadata". All fields are combined with a logical 'AND'. */
export type Chain_Metadata_Bool_Exp = {
  _and?: InputMaybe<Array<Chain_Metadata_Bool_Exp>>;
  _not?: InputMaybe<Chain_Metadata_Bool_Exp>;
  _or?: InputMaybe<Array<Chain_Metadata_Bool_Exp>>;
  block_height?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
  end_block?: InputMaybe<Int_Comparison_Exp>;
  first_event_block_number?: InputMaybe<Int_Comparison_Exp>;
  is_hyper_sync?: InputMaybe<Boolean_Comparison_Exp>;
  latest_fetched_block_number?: InputMaybe<Int_Comparison_Exp>;
  latest_processed_block?: InputMaybe<Int_Comparison_Exp>;
  num_batches_fetched?: InputMaybe<Int_Comparison_Exp>;
  num_events_processed?: InputMaybe<Int_Comparison_Exp>;
  start_block?: InputMaybe<Int_Comparison_Exp>;
  timestamp_caught_up_to_head_or_endblock?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "chain_metadata". */
export type Chain_Metadata_Order_By = {
  block_height?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  end_block?: InputMaybe<Order_By>;
  first_event_block_number?: InputMaybe<Order_By>;
  is_hyper_sync?: InputMaybe<Order_By>;
  latest_fetched_block_number?: InputMaybe<Order_By>;
  latest_processed_block?: InputMaybe<Order_By>;
  num_batches_fetched?: InputMaybe<Order_By>;
  num_events_processed?: InputMaybe<Order_By>;
  start_block?: InputMaybe<Order_By>;
  timestamp_caught_up_to_head_or_endblock?: InputMaybe<Order_By>;
};

/** select columns of table "chain_metadata" */
export enum Chain_Metadata_Select_Column {
  /** column name */
  BlockHeight = 'block_height',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  EndBlock = 'end_block',
  /** column name */
  FirstEventBlockNumber = 'first_event_block_number',
  /** column name */
  IsHyperSync = 'is_hyper_sync',
  /** column name */
  LatestFetchedBlockNumber = 'latest_fetched_block_number',
  /** column name */
  LatestProcessedBlock = 'latest_processed_block',
  /** column name */
  NumBatchesFetched = 'num_batches_fetched',
  /** column name */
  NumEventsProcessed = 'num_events_processed',
  /** column name */
  StartBlock = 'start_block',
  /** column name */
  TimestampCaughtUpToHeadOrEndblock = 'timestamp_caught_up_to_head_or_endblock'
}

/** Streaming cursor of the table "chain_metadata" */
export type Chain_Metadata_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Chain_Metadata_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Chain_Metadata_Stream_Cursor_Value_Input = {
  block_height?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
  end_block?: InputMaybe<Scalars['Int']['input']>;
  first_event_block_number?: InputMaybe<Scalars['Int']['input']>;
  is_hyper_sync?: InputMaybe<Scalars['Boolean']['input']>;
  latest_fetched_block_number?: InputMaybe<Scalars['Int']['input']>;
  latest_processed_block?: InputMaybe<Scalars['Int']['input']>;
  num_batches_fetched?: InputMaybe<Scalars['Int']['input']>;
  num_events_processed?: InputMaybe<Scalars['Int']['input']>;
  start_block?: InputMaybe<Scalars['Int']['input']>;
  timestamp_caught_up_to_head_or_endblock?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to compare columns of type "collateralactiontype". All fields are combined with logical 'AND'. */
export type Collateralactiontype_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['collateralactiontype']['input']>;
  _gt?: InputMaybe<Scalars['collateralactiontype']['input']>;
  _gte?: InputMaybe<Scalars['collateralactiontype']['input']>;
  _in?: InputMaybe<Array<Scalars['collateralactiontype']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['collateralactiontype']['input']>;
  _lte?: InputMaybe<Scalars['collateralactiontype']['input']>;
  _neq?: InputMaybe<Scalars['collateralactiontype']['input']>;
  _nin?: InputMaybe<Array<Scalars['collateralactiontype']['input']>>;
};

/** Boolean expression to compare columns of type "contract_type". All fields are combined with logical 'AND'. */
export type Contract_Type_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['contract_type']['input']>;
  _gt?: InputMaybe<Scalars['contract_type']['input']>;
  _gte?: InputMaybe<Scalars['contract_type']['input']>;
  _in?: InputMaybe<Array<Scalars['contract_type']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['contract_type']['input']>;
  _lte?: InputMaybe<Scalars['contract_type']['input']>;
  _neq?: InputMaybe<Scalars['contract_type']['input']>;
  _nin?: InputMaybe<Array<Scalars['contract_type']['input']>>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** Boolean expression to filter rows from the table "dynamic_contract_registry". All fields are combined with a logical 'AND'. */
export type Dynamic_Contract_Registry_Bool_Exp = {
  _and?: InputMaybe<Array<Dynamic_Contract_Registry_Bool_Exp>>;
  _not?: InputMaybe<Dynamic_Contract_Registry_Bool_Exp>;
  _or?: InputMaybe<Array<Dynamic_Contract_Registry_Bool_Exp>>;
  block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
  contract_address?: InputMaybe<String_Comparison_Exp>;
  contract_type?: InputMaybe<Contract_Type_Comparison_Exp>;
  event_id?: InputMaybe<Numeric_Comparison_Exp>;
};

/** Ordering options when selecting data from "dynamic_contract_registry". */
export type Dynamic_Contract_Registry_Order_By = {
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  contract_address?: InputMaybe<Order_By>;
  contract_type?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
};

/** select columns of table "dynamic_contract_registry" */
export enum Dynamic_Contract_Registry_Select_Column {
  /** column name */
  BlockTimestamp = 'block_timestamp',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  ContractAddress = 'contract_address',
  /** column name */
  ContractType = 'contract_type',
  /** column name */
  EventId = 'event_id'
}

/** Streaming cursor of the table "dynamic_contract_registry" */
export type Dynamic_Contract_Registry_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dynamic_Contract_Registry_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dynamic_Contract_Registry_Stream_Cursor_Value_Input = {
  block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
  contract_address?: InputMaybe<Scalars['String']['input']>;
  contract_type?: InputMaybe<Scalars['contract_type']['input']>;
  event_id?: InputMaybe<Scalars['numeric']['input']>;
};

/** Boolean expression to filter rows from the table "end_of_block_range_scanned_data". All fields are combined with a logical 'AND'. */
export type End_Of_Block_Range_Scanned_Data_Bool_Exp = {
  _and?: InputMaybe<Array<End_Of_Block_Range_Scanned_Data_Bool_Exp>>;
  _not?: InputMaybe<End_Of_Block_Range_Scanned_Data_Bool_Exp>;
  _or?: InputMaybe<Array<End_Of_Block_Range_Scanned_Data_Bool_Exp>>;
  block_hash?: InputMaybe<String_Comparison_Exp>;
  block_number?: InputMaybe<Int_Comparison_Exp>;
  block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
};

/** Ordering options when selecting data from "end_of_block_range_scanned_data". */
export type End_Of_Block_Range_Scanned_Data_Order_By = {
  block_hash?: InputMaybe<Order_By>;
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
};

/** select columns of table "end_of_block_range_scanned_data" */
export enum End_Of_Block_Range_Scanned_Data_Select_Column {
  /** column name */
  BlockHash = 'block_hash',
  /** column name */
  BlockNumber = 'block_number',
  /** column name */
  BlockTimestamp = 'block_timestamp',
  /** column name */
  ChainId = 'chain_id'
}

/** Streaming cursor of the table "end_of_block_range_scanned_data" */
export type End_Of_Block_Range_Scanned_Data_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: End_Of_Block_Range_Scanned_Data_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type End_Of_Block_Range_Scanned_Data_Stream_Cursor_Value_Input = {
  block_hash?: InputMaybe<Scalars['String']['input']>;
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by aggregate values of table "entity_history" */
export type Entity_History_Aggregate_Order_By = {
  avg?: InputMaybe<Entity_History_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Entity_History_Max_Order_By>;
  min?: InputMaybe<Entity_History_Min_Order_By>;
  stddev?: InputMaybe<Entity_History_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Entity_History_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Entity_History_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Entity_History_Sum_Order_By>;
  var_pop?: InputMaybe<Entity_History_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Entity_History_Var_Samp_Order_By>;
  variance?: InputMaybe<Entity_History_Variance_Order_By>;
};

/** order by avg() on columns of table "entity_history" */
export type Entity_History_Avg_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "entity_history". All fields are combined with a logical 'AND'. */
export type Entity_History_Bool_Exp = {
  _and?: InputMaybe<Array<Entity_History_Bool_Exp>>;
  _not?: InputMaybe<Entity_History_Bool_Exp>;
  _or?: InputMaybe<Array<Entity_History_Bool_Exp>>;
  block_number?: InputMaybe<Int_Comparison_Exp>;
  block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
  entity_id?: InputMaybe<String_Comparison_Exp>;
  entity_type?: InputMaybe<Entity_Type_Comparison_Exp>;
  event?: InputMaybe<Raw_Events_Bool_Exp>;
  log_index?: InputMaybe<Int_Comparison_Exp>;
  params?: InputMaybe<Jsonb_Comparison_Exp>;
  previous_block_number?: InputMaybe<Int_Comparison_Exp>;
  previous_block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  previous_chain_id?: InputMaybe<Int_Comparison_Exp>;
  previous_log_index?: InputMaybe<Int_Comparison_Exp>;
};

/** Boolean expression to filter rows from the table "entity_history_filter". All fields are combined with a logical 'AND'. */
export type Entity_History_Filter_Bool_Exp = {
  _and?: InputMaybe<Array<Entity_History_Filter_Bool_Exp>>;
  _not?: InputMaybe<Entity_History_Filter_Bool_Exp>;
  _or?: InputMaybe<Array<Entity_History_Filter_Bool_Exp>>;
  block_number?: InputMaybe<Int_Comparison_Exp>;
  block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
  entity_id?: InputMaybe<String_Comparison_Exp>;
  entity_type?: InputMaybe<Entity_Type_Comparison_Exp>;
  event?: InputMaybe<Raw_Events_Bool_Exp>;
  log_index?: InputMaybe<Int_Comparison_Exp>;
  new_val?: InputMaybe<Jsonb_Comparison_Exp>;
  old_val?: InputMaybe<Jsonb_Comparison_Exp>;
  previous_block_number?: InputMaybe<Int_Comparison_Exp>;
  previous_log_index?: InputMaybe<Int_Comparison_Exp>;
};

/** Ordering options when selecting data from "entity_history_filter". */
export type Entity_History_Filter_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  entity_id?: InputMaybe<Order_By>;
  entity_type?: InputMaybe<Order_By>;
  event?: InputMaybe<Raw_Events_Order_By>;
  log_index?: InputMaybe<Order_By>;
  new_val?: InputMaybe<Order_By>;
  old_val?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** select columns of table "entity_history_filter" */
export enum Entity_History_Filter_Select_Column {
  /** column name */
  BlockNumber = 'block_number',
  /** column name */
  BlockTimestamp = 'block_timestamp',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  EntityId = 'entity_id',
  /** column name */
  EntityType = 'entity_type',
  /** column name */
  LogIndex = 'log_index',
  /** column name */
  NewVal = 'new_val',
  /** column name */
  OldVal = 'old_val',
  /** column name */
  PreviousBlockNumber = 'previous_block_number',
  /** column name */
  PreviousLogIndex = 'previous_log_index'
}

/** Streaming cursor of the table "entity_history_filter" */
export type Entity_History_Filter_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Entity_History_Filter_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Entity_History_Filter_Stream_Cursor_Value_Input = {
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
  entity_id?: InputMaybe<Scalars['String']['input']>;
  entity_type?: InputMaybe<Scalars['entity_type']['input']>;
  log_index?: InputMaybe<Scalars['Int']['input']>;
  new_val?: InputMaybe<Scalars['jsonb']['input']>;
  old_val?: InputMaybe<Scalars['jsonb']['input']>;
  previous_block_number?: InputMaybe<Scalars['Int']['input']>;
  previous_log_index?: InputMaybe<Scalars['Int']['input']>;
};

/** order by max() on columns of table "entity_history" */
export type Entity_History_Max_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  entity_id?: InputMaybe<Order_By>;
  entity_type?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "entity_history" */
export type Entity_History_Min_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  entity_id?: InputMaybe<Order_By>;
  entity_type?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "entity_history". */
export type Entity_History_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  entity_id?: InputMaybe<Order_By>;
  entity_type?: InputMaybe<Order_By>;
  event?: InputMaybe<Raw_Events_Order_By>;
  log_index?: InputMaybe<Order_By>;
  params?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** select columns of table "entity_history" */
export enum Entity_History_Select_Column {
  /** column name */
  BlockNumber = 'block_number',
  /** column name */
  BlockTimestamp = 'block_timestamp',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  EntityId = 'entity_id',
  /** column name */
  EntityType = 'entity_type',
  /** column name */
  LogIndex = 'log_index',
  /** column name */
  Params = 'params',
  /** column name */
  PreviousBlockNumber = 'previous_block_number',
  /** column name */
  PreviousBlockTimestamp = 'previous_block_timestamp',
  /** column name */
  PreviousChainId = 'previous_chain_id',
  /** column name */
  PreviousLogIndex = 'previous_log_index'
}

/** order by stddev() on columns of table "entity_history" */
export type Entity_History_Stddev_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "entity_history" */
export type Entity_History_Stddev_Pop_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "entity_history" */
export type Entity_History_Stddev_Samp_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "entity_history" */
export type Entity_History_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Entity_History_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Entity_History_Stream_Cursor_Value_Input = {
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
  entity_id?: InputMaybe<Scalars['String']['input']>;
  entity_type?: InputMaybe<Scalars['entity_type']['input']>;
  log_index?: InputMaybe<Scalars['Int']['input']>;
  params?: InputMaybe<Scalars['jsonb']['input']>;
  previous_block_number?: InputMaybe<Scalars['Int']['input']>;
  previous_block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  previous_chain_id?: InputMaybe<Scalars['Int']['input']>;
  previous_log_index?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "entity_history" */
export type Entity_History_Sum_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "entity_history" */
export type Entity_History_Var_Pop_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "entity_history" */
export type Entity_History_Var_Samp_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "entity_history" */
export type Entity_History_Variance_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  previous_block_number?: InputMaybe<Order_By>;
  previous_block_timestamp?: InputMaybe<Order_By>;
  previous_chain_id?: InputMaybe<Order_By>;
  previous_log_index?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "entity_type". All fields are combined with logical 'AND'. */
export type Entity_Type_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['entity_type']['input']>;
  _gt?: InputMaybe<Scalars['entity_type']['input']>;
  _gte?: InputMaybe<Scalars['entity_type']['input']>;
  _in?: InputMaybe<Array<Scalars['entity_type']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['entity_type']['input']>;
  _lte?: InputMaybe<Scalars['entity_type']['input']>;
  _neq?: InputMaybe<Scalars['entity_type']['input']>;
  _nin?: InputMaybe<Array<Scalars['entity_type']['input']>>;
};

/** Boolean expression to filter rows from the table "event_sync_state". All fields are combined with a logical 'AND'. */
export type Event_Sync_State_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Sync_State_Bool_Exp>>;
  _not?: InputMaybe<Event_Sync_State_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Sync_State_Bool_Exp>>;
  block_number?: InputMaybe<Int_Comparison_Exp>;
  block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
  log_index?: InputMaybe<Int_Comparison_Exp>;
};

/** Ordering options when selecting data from "event_sync_state". */
export type Event_Sync_State_Order_By = {
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
};

/** select columns of table "event_sync_state" */
export enum Event_Sync_State_Select_Column {
  /** column name */
  BlockNumber = 'block_number',
  /** column name */
  BlockTimestamp = 'block_timestamp',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  LogIndex = 'log_index'
}

/** Streaming cursor of the table "event_sync_state" */
export type Event_Sync_State_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Sync_State_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Sync_State_Stream_Cursor_Value_Input = {
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
  log_index?: InputMaybe<Scalars['Int']['input']>;
};

export type Get_Entity_History_Filter_Args = {
  end_block?: InputMaybe<Scalars['Int']['input']>;
  end_chain_id?: InputMaybe<Scalars['Int']['input']>;
  end_log_index?: InputMaybe<Scalars['Int']['input']>;
  end_timestamp?: InputMaybe<Scalars['Int']['input']>;
  start_block?: InputMaybe<Scalars['Int']['input']>;
  start_chain_id?: InputMaybe<Scalars['Int']['input']>;
  start_log_index?: InputMaybe<Scalars['Int']['input']>;
  start_timestamp?: InputMaybe<Scalars['Int']['input']>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** Boolean expression to filter rows from the table "persisted_state". All fields are combined with a logical 'AND'. */
export type Persisted_State_Bool_Exp = {
  _and?: InputMaybe<Array<Persisted_State_Bool_Exp>>;
  _not?: InputMaybe<Persisted_State_Bool_Exp>;
  _or?: InputMaybe<Array<Persisted_State_Bool_Exp>>;
  abi_files_hash?: InputMaybe<String_Comparison_Exp>;
  config_hash?: InputMaybe<String_Comparison_Exp>;
  envio_version?: InputMaybe<String_Comparison_Exp>;
  handler_files_hash?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  schema_hash?: InputMaybe<String_Comparison_Exp>;
};

/** Ordering options when selecting data from "persisted_state". */
export type Persisted_State_Order_By = {
  abi_files_hash?: InputMaybe<Order_By>;
  config_hash?: InputMaybe<Order_By>;
  envio_version?: InputMaybe<Order_By>;
  handler_files_hash?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  schema_hash?: InputMaybe<Order_By>;
};

/** select columns of table "persisted_state" */
export enum Persisted_State_Select_Column {
  /** column name */
  AbiFilesHash = 'abi_files_hash',
  /** column name */
  ConfigHash = 'config_hash',
  /** column name */
  EnvioVersion = 'envio_version',
  /** column name */
  HandlerFilesHash = 'handler_files_hash',
  /** column name */
  Id = 'id',
  /** column name */
  SchemaHash = 'schema_hash'
}

/** Streaming cursor of the table "persisted_state" */
export type Persisted_State_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Persisted_State_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Persisted_State_Stream_Cursor_Value_Input = {
  abi_files_hash?: InputMaybe<Scalars['String']['input']>;
  config_hash?: InputMaybe<Scalars['String']['input']>;
  envio_version?: InputMaybe<Scalars['String']['input']>;
  handler_files_hash?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  schema_hash?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to filter rows from the table "raw_events". All fields are combined with a logical 'AND'. */
export type Raw_Events_Bool_Exp = {
  _and?: InputMaybe<Array<Raw_Events_Bool_Exp>>;
  _not?: InputMaybe<Raw_Events_Bool_Exp>;
  _or?: InputMaybe<Array<Raw_Events_Bool_Exp>>;
  block_fields?: InputMaybe<Jsonb_Comparison_Exp>;
  block_hash?: InputMaybe<String_Comparison_Exp>;
  block_number?: InputMaybe<Int_Comparison_Exp>;
  block_timestamp?: InputMaybe<Int_Comparison_Exp>;
  chain_id?: InputMaybe<Int_Comparison_Exp>;
  contract_name?: InputMaybe<String_Comparison_Exp>;
  db_write_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  event_history?: InputMaybe<Entity_History_Bool_Exp>;
  event_id?: InputMaybe<Numeric_Comparison_Exp>;
  event_name?: InputMaybe<String_Comparison_Exp>;
  log_index?: InputMaybe<Int_Comparison_Exp>;
  params?: InputMaybe<Jsonb_Comparison_Exp>;
  src_address?: InputMaybe<String_Comparison_Exp>;
  transaction_fields?: InputMaybe<Jsonb_Comparison_Exp>;
};

/** Ordering options when selecting data from "raw_events". */
export type Raw_Events_Order_By = {
  block_fields?: InputMaybe<Order_By>;
  block_hash?: InputMaybe<Order_By>;
  block_number?: InputMaybe<Order_By>;
  block_timestamp?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  contract_name?: InputMaybe<Order_By>;
  db_write_timestamp?: InputMaybe<Order_By>;
  event_history_aggregate?: InputMaybe<Entity_History_Aggregate_Order_By>;
  event_id?: InputMaybe<Order_By>;
  event_name?: InputMaybe<Order_By>;
  log_index?: InputMaybe<Order_By>;
  params?: InputMaybe<Order_By>;
  src_address?: InputMaybe<Order_By>;
  transaction_fields?: InputMaybe<Order_By>;
};

/** select columns of table "raw_events" */
export enum Raw_Events_Select_Column {
  /** column name */
  BlockFields = 'block_fields',
  /** column name */
  BlockHash = 'block_hash',
  /** column name */
  BlockNumber = 'block_number',
  /** column name */
  BlockTimestamp = 'block_timestamp',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  ContractName = 'contract_name',
  /** column name */
  DbWriteTimestamp = 'db_write_timestamp',
  /** column name */
  EventId = 'event_id',
  /** column name */
  EventName = 'event_name',
  /** column name */
  LogIndex = 'log_index',
  /** column name */
  Params = 'params',
  /** column name */
  SrcAddress = 'src_address',
  /** column name */
  TransactionFields = 'transaction_fields'
}

/** Streaming cursor of the table "raw_events" */
export type Raw_Events_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Raw_Events_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Raw_Events_Stream_Cursor_Value_Input = {
  block_fields?: InputMaybe<Scalars['jsonb']['input']>;
  block_hash?: InputMaybe<Scalars['String']['input']>;
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_timestamp?: InputMaybe<Scalars['Int']['input']>;
  chain_id?: InputMaybe<Scalars['Int']['input']>;
  contract_name?: InputMaybe<Scalars['String']['input']>;
  db_write_timestamp?: InputMaybe<Scalars['timestamp']['input']>;
  event_id?: InputMaybe<Scalars['numeric']['input']>;
  event_name?: InputMaybe<Scalars['String']['input']>;
  log_index?: InputMaybe<Scalars['Int']['input']>;
  params?: InputMaybe<Scalars['jsonb']['input']>;
  src_address?: InputMaybe<Scalars['String']['input']>;
  transaction_fields?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

export type GetCollateralAssetsQueryVariables = Exact<{
  account?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetCollateralAssetsQuery = { __typename?: 'query_root', User: Array<{ __typename?: 'User', collateralAssets: Array<{ __typename?: 'UserCollateral', amount: any, collateralAsset_id: string }> }> };

export type GetCollateralConfigurationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCollateralConfigurationsQuery = { __typename?: 'query_root', CollateralAsset: Array<{ __typename?: 'CollateralAsset', supplyCap: any, priceFeedId: string, id: string, paused: boolean, liquidationPenalty: any, liquidateCollateralFactor: any, decimals: number, borrowCollateralFactor: any }> };

export type GetMarketConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMarketConfigurationQuery = { __typename?: 'query_root', MarketConfiguartion: Array<{ __typename?: 'MarketConfiguartion', baseToken: string, baseTokenDecimals: number, baseTokenPriceFeedId: string, baseBorrowMin: any, supplyKink: any, borrowKink: any, borrowPerSecondInterestRateBase: any, borrowPerSecondInterestRateSlopeLow: any, borrowPerSecondInterestRateSlopeHigh: any }> };

export type GetMarketStateQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMarketStateQuery = { __typename?: 'query_root', MarketState: Array<{ __typename?: 'MarketState', totalBorrowBase: any, totalSupplyBase: any }> };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetCollateralAssetsDocument = new TypedDocumentString(`
    query GetCollateralAssets($account: String) {
  User(where: {address: {_eq: $account}}) {
    collateralAssets {
      amount
      collateralAsset_id
    }
  }
}
    `) as unknown as TypedDocumentString<GetCollateralAssetsQuery, GetCollateralAssetsQueryVariables>;
export const GetCollateralConfigurationsDocument = new TypedDocumentString(`
    query GetCollateralConfigurations {
  CollateralAsset {
    supplyCap
    priceFeedId
    id
    paused
    liquidationPenalty
    liquidateCollateralFactor
    decimals
    borrowCollateralFactor
  }
}
    `) as unknown as TypedDocumentString<GetCollateralConfigurationsQuery, GetCollateralConfigurationsQueryVariables>;
export const GetMarketConfigurationDocument = new TypedDocumentString(`
    query GetMarketConfiguration {
  MarketConfiguartion {
    baseToken
    baseTokenDecimals
    baseTokenPriceFeedId
    baseBorrowMin
    supplyKink
    borrowKink
    borrowPerSecondInterestRateBase
    borrowPerSecondInterestRateSlopeLow
    borrowPerSecondInterestRateSlopeHigh
  }
}
    `) as unknown as TypedDocumentString<GetMarketConfigurationQuery, GetMarketConfigurationQueryVariables>;
export const GetMarketStateDocument = new TypedDocumentString(`
    query GetMarketState {
  MarketState {
    totalBorrowBase
    totalSupplyBase
  }
}
    `) as unknown as TypedDocumentString<GetMarketStateQuery, GetMarketStateQueryVariables>;