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
