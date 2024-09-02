import {
  CONTRACT_ADDRESSES,
  type IContractsConfig,
  NODE_URL,
} from '@src/constants';
import { THEME_TYPE } from '@src/themes/ThemeProvider';
import type RootStore from '@stores/RootStore';
import { makeAutoObservable } from 'mobx';

interface ILogItem {
  fuelAddress: string | null;
  address: string | null;
  timestamp: string | null;
  action: string | null;
  errorMessage: string | null;
}

export interface ISerializedSettingsStore {
  selectedTheme: THEME_TYPE | null;
  version: string | null;
  faucetTokens: Record<string, string> | null;
  mintedTokens: Record<string, string> | null;
  log: string | null;
}

class SettingsStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedSettingsStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (initState != null) {
      if (initState.selectedTheme != null) {
        this.selectedTheme = initState.selectedTheme;
      }
      if (initState.version != null) {
        this.version = initState.version;
      }
      if (initState.faucetTokens != null) {
        this.faucetTokens = initState.faucetTokens;
      }
      if (initState.mintedTokens != null) {
        this.mintedTokens = initState.mintedTokens;
      }
      if (initState.log != null) {
        this.log = initState.log;
      }
    }
  }

  version = '0.1.0';
  // setVersion = (s: string) => (this.version = s);

  faucetTokens: Record<string, string> | null = null;
  // setFaucetTokens = (s: Record<string, string>) => (this.faucetTokens = s);
  // addFaucetToken = (s: any) => (this.faucetTokens = s);

  get faucetTokenForCurrentAccount() {
    return '';
  }

  selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

  toggleTheme = (): void => {
    this.selectedTheme =
      this.selectedTheme === THEME_TYPE.LIGHT_THEME
        ? THEME_TYPE.DARK_THEME
        : THEME_TYPE.LIGHT_THEME;
  };

  serialize = (): ISerializedSettingsStore => ({
    selectedTheme: this.selectedTheme,
    version: this.version,
    faucetTokens: this.faucetTokens,
    mintedTokens: this.mintedTokens,
    log: this.log,
  });

  network: string = NODE_URL;
  setNetwork = (s: string) => {
    this.network = s;
  };

  mintedTokens: Record<string, string> | null = null;
  setMintedTokens = (s: Record<string, string> | null) => {
    this.mintedTokens = s;
  };

  get mintedTokensForCurrentAccount() {
    if (this.mintedTokens == null) return null;
    if (this.rootStore.accountStore.address == null) return null;
    return this.mintedTokens[this.rootStore.accountStore.address];
  }

  addMintedToken = (tokenAddress: string) => {
    const tokens = this.mintedTokensForCurrentAccount;
    const accountAddress = this.rootStore.accountStore.address;
    if (accountAddress == null) return;
    if (this.mintedTokens == null) {
      this.setMintedTokens({ [accountAddress]: tokenAddress });
      return;
    }

    this.setMintedTokens({
      ...this.mintedTokens,
      [accountAddress]:
        tokens == null
          ? tokenAddress
          : tokens?.concat(',').concat(tokenAddress),
    });
  };

  get currentVersionConfig(): IContractsConfig {
    return CONTRACT_ADDRESSES;
  }

  log: string | null = null;
  setLog = (s: string | null) => {
    this.log = s;
  };

  addErrorToLog = (log: ILogItem) => {
    const currentLog = this.log == null ? [] : JSON.parse(this.log);
    const newLog = JSON.stringify([...currentLog, log]);
    this.setLog(newLog);
  };
  exportLogData = () => {
    if (this.log == null) {
      console.error('your log file is empty');
      return;
    }
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      this.log ?? ''
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'swayLendLogFile.json';
    link.click();
  };
}

export default SettingsStore;
