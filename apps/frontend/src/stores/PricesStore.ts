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
    // try {
    //   const wallet = accountStore.walletToRead;
    //   if (wallet == null) return;
    //   const oracleContract = OracleAbi__factory.connect(priceOracle, wallet);

    //   const response = await Promise.all(
    //     TOKENS_LIST.map((token) =>
    //       oracleContract.functions.get_price(token.assetId).dryRun()
    //     )
    //   );
    //   console.log(response);

    //   // TODO[old] change to locked wallet
    //   // console.log("response", response);
    //   if (response.length > 0) {
    //     const v = response.reduce(
    //       (acc, { value }) => ({
    //         // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
    //         ...acc,
    //         [value.asset_id]: BN.formatUnits(value.price.toString(), 9),
    //       }),
    //       {}
    //     );
    //     this.setTokensPrices(v);
    //   }
    // } catch (e) {
    //   console.log('updateTokenPrices error');
    //   console.log(e);
    // }
  };
}

export default PricesStore;
