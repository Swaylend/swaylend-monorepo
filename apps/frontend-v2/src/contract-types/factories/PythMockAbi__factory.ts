/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.93.0
  Forc version: 0.62.0
  Fuel-Core version: 0.31.0
*/

import { Interface, Contract, ContractFactory } from "fuels";
import type { Provider, Account, AbstractAddress, BytesLike, DeployContractOptions, StorageSlot, DeployContractResult } from "fuels";
import type { PythMockAbi, PythMockAbiInterface } from "../PythMockAbi";

const _abi = {
  "encoding": "1",
  "types": [
    {
      "typeId": 0,
      "type": "()",
      "components": [],
      "typeParameters": null
    },
    {
      "typeId": 1,
      "type": "b256",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 2,
      "type": "enum PythError",
      "components": [
        {
          "name": "FeesCanOnlyBePaidInTheBaseAsset",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "FuturePriceNotAllowed",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "GuardianSetNotFound",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "IncorrectMessageType",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InsufficientFee",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidArgument",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidAttestationSize",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidDataSourcesLength",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidExponent",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidGovernanceDataSource",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidGovernanceAction",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidGovernanceMessage",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidGovernanceModule",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidGovernanceTarget",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidHeaderSize",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidMagic",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidMajorVersion",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidMinorVersion",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidPayloadId",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidPayloadLength",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidPriceFeedDataLength",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidProof",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidUpdateData",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidUpdateDataLength",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidUpdateDataSource",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidUpgradeModule",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidWormholeAddressToSet",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "LengthOfPriceFeedIdsAndPublishTimesMustMatch",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NewGuardianSetIsEmpty",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NumberOfUpdatesIrretrievable",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "OldGovernanceMessage",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "OutdatedPrice",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "PriceFeedNotFound",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "PriceFeedNotFoundWithinRange",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "WormholeGovernanceActionNotFound",
          "type": 0,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 3,
      "type": "generic T",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 4,
      "type": "raw untyped ptr",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 5,
      "type": "struct Bytes",
      "components": [
        {
          "name": "buf",
          "type": 8,
          "typeArguments": null
        },
        {
          "name": "len",
          "type": 12,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 6,
      "type": "struct Price",
      "components": [
        {
          "name": "confidence",
          "type": 12,
          "typeArguments": null
        },
        {
          "name": "exponent",
          "type": 11,
          "typeArguments": null
        },
        {
          "name": "price",
          "type": 12,
          "typeArguments": null
        },
        {
          "name": "publish_time",
          "type": 12,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 7,
      "type": "struct PriceFeed",
      "components": [
        {
          "name": "ema_price",
          "type": 6,
          "typeArguments": null
        },
        {
          "name": "id",
          "type": 1,
          "typeArguments": null
        },
        {
          "name": "price",
          "type": 6,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 8,
      "type": "struct RawBytes",
      "components": [
        {
          "name": "ptr",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "cap",
          "type": 12,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 9,
      "type": "struct RawVec",
      "components": [
        {
          "name": "ptr",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "cap",
          "type": 12,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        3
      ]
    },
    {
      "typeId": 10,
      "type": "struct Vec",
      "components": [
        {
          "name": "buf",
          "type": 9,
          "typeArguments": [
            {
              "name": "",
              "type": 3,
              "typeArguments": null
            }
          ]
        },
        {
          "name": "len",
          "type": 12,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        3
      ]
    },
    {
      "typeId": 11,
      "type": "u32",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 12,
      "type": "u64",
      "components": null,
      "typeParameters": null
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "price_feed_id",
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "ema_price",
      "output": {
        "name": "",
        "type": 6,
        "typeArguments": null
      },
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
          "type": 12,
          "typeArguments": null
        },
        {
          "name": "price_feed_id",
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "ema_price_no_older_than",
      "output": {
        "name": "",
        "type": 6,
        "typeArguments": null
      },
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
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "ema_price_unsafe",
      "output": {
        "name": "",
        "type": 6,
        "typeArguments": null
      },
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
          "type": 12,
          "typeArguments": null
        },
        {
          "name": "min_publish_time",
          "type": 12,
          "typeArguments": null
        },
        {
          "name": "price_feed_ids",
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 1,
              "typeArguments": null
            }
          ]
        },
        {
          "name": "update_data",
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 5,
              "typeArguments": null
            }
          ]
        }
      ],
      "name": "parse_price_feed_updates",
      "output": {
        "name": "",
        "type": 10,
        "typeArguments": [
          {
            "name": "",
            "type": 7,
            "typeArguments": null
          }
        ]
      },
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
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "price",
      "output": {
        "name": "",
        "type": 6,
        "typeArguments": null
      },
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
          "type": 12,
          "typeArguments": null
        },
        {
          "name": "price_feed_id",
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "price_no_older_than",
      "output": {
        "name": "",
        "type": 6,
        "typeArguments": null
      },
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
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "price_unsafe",
      "output": {
        "name": "",
        "type": 6,
        "typeArguments": null
      },
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
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 5,
              "typeArguments": null
            }
          ]
        }
      ],
      "name": "update_fee",
      "output": {
        "name": "",
        "type": 12,
        "typeArguments": null
      },
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
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 5,
              "typeArguments": null
            }
          ]
        }
      ],
      "name": "update_price_feeds",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
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
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 1,
              "typeArguments": null
            }
          ]
        },
        {
          "name": "publish_times",
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 12,
              "typeArguments": null
            }
          ]
        },
        {
          "name": "update_data",
          "type": 10,
          "typeArguments": [
            {
              "name": "",
              "type": 5,
              "typeArguments": null
            }
          ]
        }
      ],
      "name": "update_price_feeds_if_necessary",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
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
      "output": {
        "name": "",
        "type": 12,
        "typeArguments": null
      },
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
      "loggedType": {
        "name": "",
        "type": 2,
        "typeArguments": []
      }
    }
  ],
  "messagesTypes": [],
  "configurables": []
};

const _storageSlots: StorageSlot[] = [];

export const PythMockAbi__factory = {
  abi: _abi,

  storageSlots: _storageSlots,

  createInterface(): PythMockAbiInterface {
    return new Interface(_abi) as unknown as PythMockAbiInterface
  },

  connect(
    id: string | AbstractAddress,
    accountOrProvider: Account | Provider
  ): PythMockAbi {
    return new Contract(id, _abi, accountOrProvider) as unknown as PythMockAbi
  },

  async deployContract(
    bytecode: BytesLike,
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<PythMockAbi>> {
    const factory = new ContractFactory(bytecode, _abi, wallet);

    return factory.deployContract<PythMockAbi>({
      storageSlots: _storageSlots,
      ...options,
    });
  },
}
