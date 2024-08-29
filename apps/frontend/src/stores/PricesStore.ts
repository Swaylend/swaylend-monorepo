import type { IToken } from '@src/constants';
import BN from '@src/utils/BN';
import type RootStore from '@stores/RootStore';
import { makeAutoObservable, reaction } from 'mobx';

//fixme fix of getting price of tokens
class PricesStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.updateTokenPrices().then();
    //todo make it back 60 when ret error is fixed
    setInterval(this.updateTokenPrices, 60 * 1000);
    reaction(
      () => [
        this.rootStore.settingsStore.version,
        this.rootStore.accountStore.address,
      ],
      () => this.updateTokenPrices()
    );
  }

  tokensPrices: Record<string, BN> | null = null;
  setTokensPrices = (v: Record<string, BN>) => {
    this.tokensPrices = v;
  };

  getTokenPrice = (assetId: string) => {
    if (this.tokensPrices == null) return BN.ZERO;
    const price = this.tokensPrices[assetId];
    return price == null ? BN.ZERO : price;
  };

  getFormattedTokenPrice = (token: IToken): string => {
    if (this.tokensPrices == null) return '$ 0.00';
    const price = this.tokensPrices[token.assetId];
    return `$${price.toFormat(2)}`;
  };

  updateTokenPrices = async () => {
    const { settingsStore, accountStore } = this.rootStore;
    const { priceOracle } = settingsStore.currentVersionConfig;
  };
}

export default PricesStore;
