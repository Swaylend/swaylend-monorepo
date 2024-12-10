import { Wallet } from 'fuels';
import { BakoProvider, Vault } from 'bakosafe';
import { WithdrawReserves, Market } from './types';

require('dotenv').config({ path: '../.env' });

const PROVIDER_URL =
  process.env.PROVIDER_URL || 'https://testnet.fuel.network/v1/graphql';
const PRIVATE_KEY = process.env.SIGNING_KEY!;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS!;
const PROXY_CONTRACT_ID = process.env.PROXY_CONTRACT_ID!;

const main = async () => {
  console.log('Sanity check');
  console.log('Provider URL:', PROVIDER_URL);
  console.log('Vault Address:', VAULT_ADDRESS);
  console.log('Proxy contract: ', PROXY_CONTRACT_ID);

  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY);

  const amount = 10;

  // Create a challenge to authenticate in BakoProvider
  const challenge = await BakoProvider.setup({
    address: wallet.address.toB256(),
    provider: PROVIDER_URL,
  });
  const token = await wallet.signMessage(challenge);
  const provider = await BakoProvider.authenticate(PROVIDER_URL, {
    token,
    challenge,
    address: wallet.address.toB256(),
  });

  // Instance the vault by address
  const vault = await Vault.fromAddress(VAULT_ADDRESS, provider);

  // Create a script instance and get the transaction request
  const script = new WithdrawReserves(vault);
  const proxyId = { bits: PROXY_CONTRACT_ID };

  const configurableConstants = {
    MARKET_CONTRACT_ID: proxyId,
  };

  script.setConfigurableConstants(configurableConstants);

  const receiverId = { bits: VAULT_ADDRESS.toString() };
  const receiverIdentityInput = { ContractId: receiverId };
  const market = new Market(PROXY_CONTRACT_ID, provider);
  const request = await script.functions
    .main(receiverIdentityInput, amount)
    .addContracts([market])
    .getTransactionRequest();

  // Send the transaction to Vault
  const { hashTxId } = await vault.BakoTransfer(request, {
    name: `Withdraw Reserves: ${amount}`,
  });
  console.log('Transaction ID:', hashTxId);
};

main();
