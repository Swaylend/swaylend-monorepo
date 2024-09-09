/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.5
*/

import { ContractFactory, decompressBytecode } from "fuels";
import type { Provider, Account, DeployContractOptions, DeployContractResult } from "fuels";

import { Token } from "./Token";

const bytecode = decompressBytecode("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");

export class TokenFactory extends ContractFactory {

  static readonly bytecode = bytecode;

  constructor(accountOrProvider: Account | Provider) {
    super(bytecode, Token.abi, accountOrProvider);
  }

  static async deploy (
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<Token>> {
    const factory = new TokenFactory(wallet);

    return factory.deploy({
      storageSlots: Token.storageSlots,
      ...options,
    });
  }
}
