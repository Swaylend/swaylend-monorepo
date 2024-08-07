import AccountStore, {
  type ISerializedAccountStore,
} from '@stores/AccountStore';
import NotificationStore from '@stores/NotificationStore';
import PricesStore from '@stores/PricesStore';
import SettingsStore, {
  type ISerializedSettingsStore,
} from '@stores/SettingsStore';
import { makeAutoObservable } from 'mobx';
import DashboardStore from './DashboardStore';

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  settingsStore?: ISerializedSettingsStore;
}

export default class RootStore {
  public accountStore: AccountStore;
  public settingsStore: SettingsStore;
  public notificationStore: NotificationStore;
  public pricesStore: PricesStore;
  public dashboardStore: DashboardStore;

  constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.settingsStore = new SettingsStore(this, initState?.settingsStore);
    this.notificationStore = new NotificationStore(this);
    this.pricesStore = new PricesStore(this);
    this.dashboardStore = new DashboardStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
    settingsStore: this.settingsStore.serialize(),
  });
}
