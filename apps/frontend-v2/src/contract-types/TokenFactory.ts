/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.6
*/

import { Contract, ContractFactory, decompressBytecode } from "fuels";
import type { Provider, Account, DeployContractOptions, DeployContractResult } from "fuels";

import { Token } from "./Token";

const bytecode = decompressBytecode("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");

export class TokenFactory extends ContractFactory {

  static readonly bytecode = bytecode;

  constructor(accountOrProvider: Account | Provider) {
    super(bytecode, Token.abi, accountOrProvider);
  }

  deploy<TContract extends Contract = Contract>(
    deployOptions?: DeployContractOptions
  ): Promise<DeployContractResult<TContract>> {
    return super.deploy({
      storageSlots: Token.storageSlots,
      ...deployOptions,
    });
  }

  static async deploy (
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<Token>> {
    const factory = new TokenFactory(wallet);
    return factory.deploy(options);
  }
}
