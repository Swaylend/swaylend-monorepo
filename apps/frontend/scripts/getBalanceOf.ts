import {
  Address,
  Mnemonic,
  Provider,
  Wallet,
  WalletLocked,
  WalletUnlocked,
  getRandomB256,
} from 'fuels';
import { MarketAbi__factory } from '../src/contract-types';

async function main() {
  const TESTNET_URL = 'https://testnet.fuel.network/v1/graphql';
  const FUEL_NETWORK = 'http://127.0.0.1:4000/v1/graphql';
  const prov = await Provider.create(TESTNET_URL);

  const wallet = Wallet.fromPrivateKey(
    '0x0331479c5df9d693c52bd5036cd3c21ef913dfae507231f526ce0b17ebbad6cc',
    prov
  );
  const address =
    '0x2968d3dd71d8b517fdb57e837c419c58f7404744fb51c16e0e0a2dc18892b1f8';

  const assetIdUSDC =
    '0xcd048cd335c14b50b8bf2c69d3f542d403f7d4e9d27232d02cd2a8b7ee061e18';
  const assetIdETH =
    '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

  const contract = MarketAbi__factory.connect(
    '0x2a525a334bfd792a1effbc4d72b5b9fcdbaa8eab405bf3d691cb7688e370c81d',
    wallet
  );
  const { value } = (await contract.functions
    .get_collateral_configurations()
    // .get_user_collateral({ bits: address }, assetIdETH)
    //.get_configuration()
    .get()) as any;

  console.log(value);
}

main().catch((e) => {
  console.log(e);
});
