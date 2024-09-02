import { THEME_TYPE } from '@src/themes/ThemeProvider';
import getAlert from '@src/utils/alertUtil';
import type RootStore from '@stores/RootStore';
import { makeAutoObservable } from 'mobx';
import { type Theme, toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify/dist/types';

export type TNotifyOptions = ToastOptions & {
  link?: string;
  linkTitle?: string;
  copyTitle?: string;
  copyText?: string;
  title?: string;
  copyCallback?: () => void;
};

class NotificationStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  toast(content: string, options: TNotifyOptions = {}) {
    const theme: Theme =
      this.rootStore.settingsStore.selectedTheme === THEME_TYPE.DARK_THEME
        ? 'dark'
        : 'light';
    options.copyCallback = () => {
      toast(
        getAlert('Successfully copied!', {
          title: 'Congratulations!',
          type: 'info',
        }),
        {
          theme,
          position: 'bottom-left',
          autoClose: 1000,
        }
      );
    };
    toast(getAlert(content, options) ?? content, {
      autoClose: 5000,
      ...options,
      theme,
    });
  }
}

export default NotificationStore;
