import type RootStore from '@stores/RootStore';
import React from 'react';

export const storesContext = React.createContext<RootStore | null>(null);

export const useStores = () => {
  const rootStore = React.useContext(storesContext);
  if (rootStore == null) {
    throw new Error('No RootStore found i context');
  }
  return rootStore;
};
