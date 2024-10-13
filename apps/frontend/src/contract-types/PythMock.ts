/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.96.0
*/

import { Contract, Interface } from "fuels";
import type {
  Provider,
  Account,
  StorageSlot,
  AbstractAddress,
  BigNumberish,
  BN,
  Bytes,
  FunctionFragment,
  InvokeFunction,
} from 'fuels';

import type { Enum, Vec } from "./common";

export enum PythErrorInput { FeesCanOnlyBePaidInTheBaseAsset = 'FeesCanOnlyBePaidInTheBaseAsset', FuturePriceNotAllowed = 'FuturePriceNotAllowed', GuardianSetNotFound = 'GuardianSetNotFound', IncorrectMessageType = 'IncorrectMessageType', InsufficientFee = 'InsufficientFee', InvalidArgument = 'InvalidArgument', InvalidAttestationSize = 'InvalidAttestationSize', InvalidDataSourcesLength = 'InvalidDataSourcesLength', InvalidExponent = 'InvalidExponent', InvalidGovernanceDataSource = 'InvalidGovernanceDataSource', InvalidGovernanceAction = 'InvalidGovernanceAction', InvalidGovernanceMessage = 'InvalidGovernanceMessage', InvalidGovernanceModule = 'InvalidGovernanceModule', InvalidGovernanceTarget = 'InvalidGovernanceTarget', InvalidHeaderSize = 'InvalidHeaderSize', InvalidMagic = 'InvalidMagic', InvalidMajorVersion = 'InvalidMajorVersion', InvalidMinorVersion = 'InvalidMinorVersion', InvalidPayloadId = 'InvalidPayloadId', InvalidPayloadLength = 'InvalidPayloadLength', InvalidPriceFeedDataLength = 'InvalidPriceFeedDataLength', InvalidProof = 'InvalidProof', InvalidUpdateData = 'InvalidUpdateData', InvalidUpdateDataLength = 'InvalidUpdateDataLength', InvalidUpdateDataSource = 'InvalidUpdateDataSource', InvalidUpgradeModule = 'InvalidUpgradeModule', InvalidWormholeAddressToSet = 'InvalidWormholeAddressToSet', LengthOfPriceFeedIdsAndPublishTimesMustMatch = 'LengthOfPriceFeedIdsAndPublishTimesMustMatch', NewGuardianSetIsEmpty = 'NewGuardianSetIsEmpty', NumberOfUpdatesIrretrievable = 'NumberOfUpdatesIrretrievable', OldGovernanceMessage = 'OldGovernanceMessage', OutdatedPrice = 'OutdatedPrice', PriceFeedNotFound = 'PriceFeedNotFound', PriceFeedNotFoundWithinRange = 'PriceFeedNotFoundWithinRange', WormholeGovernanceActionNotFound = 'WormholeGovernanceActionNotFound' };
export enum PythErrorOutput { FeesCanOnlyBePaidInTheBaseAsset = 'FeesCanOnlyBePaidInTheBaseAsset', FuturePriceNotAllowed = 'FuturePriceNotAllowed', GuardianSetNotFound = 'GuardianSetNotFound', IncorrectMessageType = 'IncorrectMessageType', InsufficientFee = 'InsufficientFee', InvalidArgument = 'InvalidArgument', InvalidAttestationSize = 'InvalidAttestationSize', InvalidDataSourcesLength = 'InvalidDataSourcesLength', InvalidExponent = 'InvalidExponent', InvalidGovernanceDataSource = 'InvalidGovernanceDataSource', InvalidGovernanceAction = 'InvalidGovernanceAction', InvalidGovernanceMessage = 'InvalidGovernanceMessage', InvalidGovernanceModule = 'InvalidGovernanceModule', InvalidGovernanceTarget = 'InvalidGovernanceTarget', InvalidHeaderSize = 'InvalidHeaderSize', InvalidMagic = 'InvalidMagic', InvalidMajorVersion = 'InvalidMajorVersion', InvalidMinorVersion = 'InvalidMinorVersion', InvalidPayloadId = 'InvalidPayloadId', InvalidPayloadLength = 'InvalidPayloadLength', InvalidPriceFeedDataLength = 'InvalidPriceFeedDataLength', InvalidProof = 'InvalidProof', InvalidUpdateData = 'InvalidUpdateData', InvalidUpdateDataLength = 'InvalidUpdateDataLength', InvalidUpdateDataSource = 'InvalidUpdateDataSource', InvalidUpgradeModule = 'InvalidUpgradeModule', InvalidWormholeAddressToSet = 'InvalidWormholeAddressToSet', LengthOfPriceFeedIdsAndPublishTimesMustMatch = 'LengthOfPriceFeedIdsAndPublishTimesMustMatch', NewGuardianSetIsEmpty = 'NewGuardianSetIsEmpty', NumberOfUpdatesIrretrievable = 'NumberOfUpdatesIrretrievable', OldGovernanceMessage = 'OldGovernanceMessage', OutdatedPrice = 'OutdatedPrice', PriceFeedNotFound = 'PriceFeedNotFound', PriceFeedNotFoundWithinRange = 'PriceFeedNotFoundWithinRange', WormholeGovernanceActionNotFound = 'WormholeGovernanceActionNotFound' };

export type PriceInput = { confidence: BigNumberish, exponent: BigNumberish, price: BigNumberish, publish_time: BigNumberish };
export type PriceOutput = { confidence: BN, exponent: number, price: BN, publish_time: BN };
export type PriceFeedInput = { ema_price: PriceInput, id: string, price: PriceInput };
export type PriceFeedOutput = { ema_price: PriceOutput, id: string, price: PriceOutput };

const abi = {
  "programType": "contract",
  "specVersion": "1",
  "encodingVersion": "1",
  "concreteTypes": [
    {
      "type": "()",
      "concreteTypeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
    },
    {
      "type": "b256",
      "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
    },
    {
      "type": "enum pyth_interface::errors::PythError",
      "concreteTypeId": "ef9531eda675e74905aeb0648d5f0289c85f8506754060ccaae49f3e657d2946",
      "metadataTypeId": 0
    },
    {
      "type": "struct pyth_interface::data_structures::price::Price",
      "concreteTypeId": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "metadataTypeId": 3
    },
    {
      "type": "struct pyth_interface::data_structures::price::PriceFeed",
      "concreteTypeId": "13eb7054501f8758f39326623a86e36908793ac7123adf2c5eddd0634d9c0809",
      "metadataTypeId": 4
    },
    {
      "type": "struct std::bytes::Bytes",
      "concreteTypeId": "cdd87b7d12fe505416570c294c884bca819364863efe3bf539245fa18515fbbb",
      "metadataTypeId": 5
    },
    {
      "type": "struct std::vec::Vec<b256>",
      "concreteTypeId": "32559685d0c9845f059bf9d472a0a38cf77d36c23dfcffe5489e86a65cdd9198",
      "metadataTypeId": 8,
      "typeArguments": [
        "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
      ]
    },
    {
      "type": "struct std::vec::Vec<struct pyth_interface::data_structures::price::PriceFeed>",
      "concreteTypeId": "7445e418358e558eaf1fb04dc2ee316739df0bce65fd8359c879b0dc9ffd3487",
      "metadataTypeId": 8,
      "typeArguments": [
        "13eb7054501f8758f39326623a86e36908793ac7123adf2c5eddd0634d9c0809"
      ]
    },
    {
      "type": "struct std::vec::Vec<struct std::bytes::Bytes>",
      "concreteTypeId": "2601885b27af3627b8910876fc176d900cec2b16ec78c538f5f312e785d915f5",
      "metadataTypeId": 8,
      "typeArguments": [
        "cdd87b7d12fe505416570c294c884bca819364863efe3bf539245fa18515fbbb"
      ]
    },
    {
      "type": "struct std::vec::Vec<u64>",
      "concreteTypeId": "d5bfe1d4e1ace20166c9b50cadd47e862020561bde24f5189cfc2723f5ed76f4",
      "metadataTypeId": 8,
      "typeArguments": [
        "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
      ]
    },
    {
      "type": "u64",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "metadataTypes": [
    {
      "type": "enum pyth_interface::errors::PythError",
      "metadataTypeId": 0,
      "components": [
        {
          "name": "FeesCanOnlyBePaidInTheBaseAsset",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "FuturePriceNotAllowed",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "GuardianSetNotFound",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "IncorrectMessageType",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InsufficientFee",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidArgument",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidAttestationSize",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidDataSourcesLength",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidExponent",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidGovernanceDataSource",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidGovernanceAction",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidGovernanceMessage",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidGovernanceModule",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidGovernanceTarget",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidHeaderSize",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidMagic",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidMajorVersion",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidMinorVersion",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidPayloadId",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidPayloadLength",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidPriceFeedDataLength",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidProof",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidUpdateData",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidUpdateDataLength",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidUpdateDataSource",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidUpgradeModule",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "InvalidWormholeAddressToSet",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "LengthOfPriceFeedIdsAndPublishTimesMustMatch",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "NewGuardianSetIsEmpty",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "NumberOfUpdatesIrretrievable",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "OldGovernanceMessage",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "OutdatedPrice",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "PriceFeedNotFound",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "PriceFeedNotFoundWithinRange",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        },
        {
          "name": "WormholeGovernanceActionNotFound",
          "typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }
      ]
    },
    {
      "type": "generic T",
      "metadataTypeId": 1
    },
    {
      "type": "raw untyped ptr",
      "metadataTypeId": 2
    },
    {
      "type": "struct pyth_interface::data_structures::price::Price",
      "metadataTypeId": 3,
      "components": [
        {
          "name": "confidence",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "exponent",
          "typeId": 9
        },
        {
          "name": "price",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "publish_time",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ]
    },
    {
      "type": "struct pyth_interface::data_structures::price::PriceFeed",
      "metadataTypeId": 4,
      "components": [
        {
          "name": "ema_price",
          "typeId": 3
        },
        {
          "name": "id",
          "typeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        },
        {
          "name": "price",
          "typeId": 3
        }
      ]
    },
    {
      "type": "struct std::bytes::Bytes",
      "metadataTypeId": 5,
      "components": [
        {
          "name": "buf",
          "typeId": 6
        },
        {
          "name": "len",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ]
    },
    {
      "type": "struct std::bytes::RawBytes",
      "metadataTypeId": 6,
      "components": [
        {
          "name": "ptr",
          "typeId": 2
        },
        {
          "name": "cap",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ]
    },
    {
      "type": "struct std::vec::RawVec",
      "metadataTypeId": 7,
      "components": [
        {
          "name": "ptr",
          "typeId": 2
        },
        {
          "name": "cap",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "typeParameters": [
        1
      ]
    },
    {
      "type": "struct std::vec::Vec",
      "metadataTypeId": 8,
      "components": [
        {
          "name": "buf",
          "typeId": 7,
          "typeArguments": [
            {
              "name": "",
              "typeId": 1
            }
          ]
        },
        {
          "name": "len",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "typeParameters": [
        1
      ]
    },
    {
      "type": "u32",
      "metadataTypeId": 9
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "price_feed_id",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }
      ],
      "name": "ema_price",
      "output": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "time_period",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "price_feed_id",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }
      ],
      "name": "ema_price_no_older_than",
      "output": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "price_feed_id",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }
      ],
      "name": "ema_price_unsafe",
      "output": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "max_publish_time",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "min_publish_time",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "price_feed_ids",
          "concreteTypeId": "32559685d0c9845f059bf9d472a0a38cf77d36c23dfcffe5489e86a65cdd9198"
        },
        {
          "name": "update_data",
          "concreteTypeId": "2601885b27af3627b8910876fc176d900cec2b16ec78c538f5f312e785d915f5"
        }
      ],
      "name": "parse_price_feed_updates",
      "output": "7445e418358e558eaf1fb04dc2ee316739df0bce65fd8359c879b0dc9ffd3487",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        },
        {
          "name": "payable",
          "arguments": []
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "price_feed_id",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }
      ],
      "name": "price",
      "output": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "time_period",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "price_feed_id",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }
      ],
      "name": "price_no_older_than",
      "output": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "price_feed_id",
          "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }
      ],
      "name": "price_unsafe",
      "output": "8aba92fff7345309d4313706ed7db3a811609f62da8f0d2859819db43d461ff8",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "update_data",
          "concreteTypeId": "2601885b27af3627b8910876fc176d900cec2b16ec78c538f5f312e785d915f5"
        }
      ],
      "name": "update_fee",
      "output": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "update_data",
          "concreteTypeId": "2601885b27af3627b8910876fc176d900cec2b16ec78c538f5f312e785d915f5"
        }
      ],
      "name": "update_price_feeds",
      "output": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        },
        {
          "name": "payable",
          "arguments": []
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "price_feed_ids",
          "concreteTypeId": "32559685d0c9845f059bf9d472a0a38cf77d36c23dfcffe5489e86a65cdd9198"
        },
        {
          "name": "publish_times",
          "concreteTypeId": "d5bfe1d4e1ace20166c9b50cadd47e862020561bde24f5189cfc2723f5ed76f4"
        },
        {
          "name": "update_data",
          "concreteTypeId": "2601885b27af3627b8910876fc176d900cec2b16ec78c538f5f312e785d915f5"
        }
      ],
      "name": "update_price_feeds_if_necessary",
      "output": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        },
        {
          "name": "payable",
          "arguments": []
        }
      ]
    },
    {
      "inputs": [],
      "name": "valid_time_period",
      "output": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    }
  ],
  "loggedTypes": [
    {
      "logId": "17263759643364419401",
      "concreteTypeId": "ef9531eda675e74905aeb0648d5f0289c85f8506754060ccaae49f3e657d2946"
    }
  ],
  "messagesTypes": [],
  "configurables": []
};

const storageSlots: StorageSlot[] = [];

export class PythMockInterface extends Interface {
  constructor() {
    super(abi);
  }

  declare functions: {
    ema_price: FunctionFragment;
    ema_price_no_older_than: FunctionFragment;
    ema_price_unsafe: FunctionFragment;
    parse_price_feed_updates: FunctionFragment;
    price: FunctionFragment;
    price_no_older_than: FunctionFragment;
    price_unsafe: FunctionFragment;
    update_fee: FunctionFragment;
    update_price_feeds: FunctionFragment;
    update_price_feeds_if_necessary: FunctionFragment;
    valid_time_period: FunctionFragment;
  };
}

export class PythMock extends Contract {
  static readonly abi = abi;
  static readonly storageSlots = storageSlots;

  declare interface: PythMockInterface;
  declare functions: {
    ema_price: InvokeFunction<[price_feed_id: string], PriceOutput>;
    ema_price_no_older_than: InvokeFunction<[time_period: BigNumberish, price_feed_id: string], PriceOutput>;
    ema_price_unsafe: InvokeFunction<[price_feed_id: string], PriceOutput>;
    parse_price_feed_updates: InvokeFunction<[max_publish_time: BigNumberish, min_publish_time: BigNumberish, price_feed_ids: Vec<string>, update_data: Vec<Bytes>], Vec<PriceFeedOutput>>;
    price: InvokeFunction<[price_feed_id: string], PriceOutput>;
    price_no_older_than: InvokeFunction<[time_period: BigNumberish, price_feed_id: string], PriceOutput>;
    price_unsafe: InvokeFunction<[price_feed_id: string], PriceOutput>;
    update_fee: InvokeFunction<[update_data: Vec<Bytes>], BN>;
    update_price_feeds: InvokeFunction<[update_data: Vec<Bytes>], void>;
    update_price_feeds_if_necessary: InvokeFunction<[price_feed_ids: Vec<string>, publish_times: Vec<BigNumberish>, update_data: Vec<Bytes>], void>;
    valid_time_period: InvokeFunction<[], BN>;
  };

  constructor(
    id: string | AbstractAddress,
    accountOrProvider: Account | Provider,
  ) {
    super(id, abi, accountOrProvider);
  }
}
