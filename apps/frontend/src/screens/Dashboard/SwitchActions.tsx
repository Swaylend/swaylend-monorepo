import SwitchButtons from '@components/SwitchButtons';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import type React from 'react';

type IProps = any;

const SwitchActions: React.FC<IProps> = () => {
  const { dashboardStore } = useStores();
  return (
    <SwitchButtons
      values={['Deposit', 'Borrow']}
      active={dashboardStore.mode}
      onActivate={(v) => {
        if (!dashboardStore.loading) {
          dashboardStore.setMode(v);
          dashboardStore.setAction(null);
          dashboardStore.setActionTokenAssetId(null);
        }
      }}
    />
  );
};
export default observer(SwitchActions);
