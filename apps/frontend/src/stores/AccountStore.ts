import { type IToken, NODE_URL, TOKENS_LIST } from '@src/constants';
import Balance from '@src/entities/Balance';
import BN from '@src/utils/BN';
import type RootStore from '@stores/RootStore';
import {
  Address,
  Provider,
  type WalletLocked,
  type WalletUnlocked,
} from 'fuels';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';

export enum LOGIN_TYPE {
  FUEL_WALLET = 'Fuel Wallet',
  FUELET = 'Fuelet Wallet',
  // GENERATE_SEED = 'Generate seed',
  WALLET_CONNECT = 'Ethereum Wallets',
}

export interface ISerializedAccountStore {
  address: string | null;
}

class AccountStore {
  public readonly rootStore: RootStore;
  public provider: Provider | null = null;

  public get initialized() {
    return this.provider != null;
  }

  private setProvider = (provider: Provider | null) => {
    this.provider = provider;
  };

  constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    if (initState) {
      this.setAddress(initState.address);
    }

    when(() => this.provider != null, this.updateAccountBalances);
    setInterval(this.updateAccountBalances, 15 * 1000);
    reaction(
      () => this.address,
      () => Promise.all([this.updateAccountBalances()])
    );
  }

  fuel: any = null;
  setFuel = (fuel: any) => {
    this.fuel = fuel;
  };

  initProvider = async (provider: Provider | null) => {
    if (provider) {
      this.setProvider(provider);
      return;
    }

    try {
      const provider = await Provider.create(NODE_URL);
      runInAction(() => {
        this.setProvider(provider);
      });
    } catch (error) {
      console.error('Failed to create provider', error);
    }
  };

  public assetBalances: Balance[] | null = null;
  setAssetBalances = (v: Balance[] | null) => {
    this.assetBalances = v;
  };

  updateAccountBalances = async () => {
    if (this.address == null) {
      this.setAssetBalances([]);
      return;
    }
    const address = Address.fromString(this.address);
    let getBalanceResponse = await this.provider?.getBalances(address);

    if (getBalanceResponse === undefined) {
      getBalanceResponse = { balances: [] };
    }

    const assetBalances = TOKENS_LIST.map((asset) => {
      const t = getBalanceResponse!.balances.find(
        ({ assetId }) => asset.assetId === assetId
      );
      const balance = t != null ? new BN(t.amount.toString()) : BN.ZERO;
      if (t == null)
        return new Balance({ balance, usdEquivalent: BN.ZERO, ...asset });

      return new Balance({ balance, ...asset });
    });
    this.setAssetBalances(assetBalances);
  };

  getBalance = (token: IToken): BN | null => {
    const balance = this.findBalanceByAssetId(token.assetId);
    if (balance == null) return null;
    return balance.balance ?? BN.ZERO;
  };

  getFormattedBalance = (token: IToken): string | null => {
    const balance = this.findBalanceByAssetId(token.assetId);
    if (balance == null) return null;
    return BN.formatUnits(balance.balance ?? BN.ZERO, token.decimals).toFormat(
      4
    );
  };
  findBalanceByAssetId = (assetId: string) =>
    this.assetBalances?.find((balance) => balance.assetId === assetId);

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    })
      .filter((v) => v.usdEquivalent?.gt(0))
      .sort((a, b) => {
        if (a.usdEquivalent == null && b.usdEquivalent == null) return 0;
        if (a.usdEquivalent == null && b.usdEquivalent != null) return 1;
        if (a.usdEquivalent == null && b.usdEquivalent == null) return -1;
        return a.usdEquivalent!.lt(b.usdEquivalent!) ? 1 : -1;
      });
  }

  public address: string | null = null;
  setAddress = (address: string | null) => {
    this.address = address;
  };

  serialize = (): ISerializedAccountStore => ({
    address: this.address,
  });

  getWallet = async (): Promise<WalletLocked | WalletUnlocked | null> => {
    if (this.address == null || this.fuel == null) return null;
    return this.fuel.getWallet(this.address);
  };
}

export default AccountStore;
