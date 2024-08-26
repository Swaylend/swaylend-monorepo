/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.1
*/

import { ContractFactory, decompressBytecode } from "fuels";
import type { Provider, Account, DeployContractOptions, DeployContractResult } from "fuels";

import { TestProject } from "./TestProject";

const bytecode = decompressBytecode("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");

export class TestProjectFactory extends ContractFactory {

  static readonly bytecode = bytecode;

  constructor(accountOrProvider: Account | Provider) {
    super(bytecode, TestProject.abi, accountOrProvider);
  }

  static async deploy (
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<TestProject>> {
    const factory = new TestProjectFactory(wallet);

    return factory.deploy({
      storageSlots: TestProject.storageSlots,
      ...options,
    });
  }
}