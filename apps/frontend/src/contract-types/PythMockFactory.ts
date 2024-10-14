/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.96.1
*/

import { Contract, ContractFactory, decompressBytecode } from "fuels";
import type { Provider, Account, DeployContractOptions, DeployContractResult } from "fuels";

import { PythMock } from "./PythMock";

const bytecode = decompressBytecode("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");

export class PythMockFactory extends ContractFactory {

  static readonly bytecode = bytecode;

  constructor(accountOrProvider: Account | Provider) {
    super(bytecode, PythMock.abi, accountOrProvider);
  }

  override deploy<TContract extends Contract = Contract>(
    deployOptions?: DeployContractOptions
  ): Promise<DeployContractResult<TContract>> {
    return super.deploy({
      storageSlots: PythMock.storageSlots,
      ...deployOptions,
    });
  }

  static async deploy (
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<PythMock>> {
    const factory = new PythMockFactory(wallet);
    return factory.deploy(options);
  }
}
