import Button from '@components/Button';
import { Column, Row } from '@components/Flex';
import Loading from '@components/Loading';
import Scrollbar from '@components/Scrollbar';
import SizedBox from '@components/SizedBox';
import Table from '@components/Table';
import Text from '@components/Text';
import TokenIcon from '@components/TokenIcon';
import {
  useAccount,
  useBalance,
  useConnectUI,
  useIsConnected,
} from '@fuels/react';
import { useFaucetVM } from '@screens/Faucet/FaucetVm';
import { FAUCET_URL, TOKENS_BY_SYMBOL } from '@src/constants';
import { useStores } from '@stores';
import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';

type IProps = any;

const TokensFaucetTable: React.FC<IProps> = () => {
  const { accountStore, settingsStore, pricesStore } = useStores();
  const { connect } = useConnectUI();
  const { account } = useAccount();
  const { isConnected } = useIsConnected();
  const vm = useFaucetVM();
  const [tokens, setTokens] = useState<any>([]);
  const { balance: ethBalance } = useBalance({
    assetId: TOKENS_BY_SYMBOL.ETH.assetId,
  });
  const mintedTokens = settingsStore.mintedTokensForCurrentAccount?.split(',');
  useMemo(() => {
    setTokens(
      vm.faucetTokens.map((t) => ({
        asset: (
          <Row>
            <TokenIcon size="small" src={t.logo} alt="logo" />
            <SizedBox width={16} />
            <Column crossAxisSize="max">
              <Text size="medium" fitContent style={{ whiteSpace: 'nowrap' }}>
                {t.name}
              </Text>
              <Text
                fitContent
                style={{ whiteSpace: 'nowrap' }}
                type="secondary"
                size="small"
              >
                Testnet
              </Text>
            </Column>
          </Row>
        ),
        amount: (
          <Column crossAxisSize="max">
            <Text fitContent style={{ whiteSpace: 'nowrap' }} weight={500}>
              {`${t.mintAmount.toFormat()} ${t.symbol}`}
            </Text>
            {/* <Text fitContent style={{ whiteSpace: 'nowrap' }} type="secondary">
              $ {t.mintAmountDollar.toFormat(2)}
            </Text> */}
          </Column>
        ),
        balance: (
          <Column crossAxisSize="max">
            <Text fitContent style={{ whiteSpace: 'nowrap' }} weight={500}>
              {`${t.formatBalance?.toFormat(4)} ${t.symbol}`}
            </Text>
            {/* <Text fitContent style={{ whiteSpace: 'nowrap' }} type="secondary">
              $ {t.balanceDollar.toFormat(2)}
            </Text> */}
          </Column>
        ),
        btn: (() => {
          if (!isConnected)
            return (
              <Button fixed onClick={() => connect()}>
                Connect wallet
              </Button>
            );
          if (!vm.initialized)
            return (
              <Button fixed disabled>
                <Loading />
              </Button>
            );
          if (mintedTokens?.includes(t.assetId))
            return (
              <Button fixed disabled>
                Minted
              </Button>
            );
          if (t.symbol !== 'ETH')
            return (
              <Button
                disabled={
                  ethBalance?.eq(0) ||
                  (vm.loading && vm.actionTokenAssetId !== t.assetId)
                }
                fixed
                onClick={() => vm.mint(t.assetId)}
              >
                {vm.loading && vm.actionTokenAssetId === t.assetId ? (
                  <Loading />
                ) : (
                  'Mint'
                )}
              </Button>
            );
          return (
            <Button
              fixed
              disabled={vm.loading || !vm.initialized}
              onClick={() => {
                if (t.symbol === 'ETH') {
                  window.open(`${FAUCET_URL}/?address=${account}`, 'blank');
                } else {
                  vm.mint(t.assetId);
                }
              }}
            >
              {vm.loading && vm.actionTokenAssetId === t.assetId ? (
                <Loading />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  Mint
                  {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 30 30"
                    stroke-width="1.5"
                    stroke="currentColor"
                    style={{ width: 16, height: 16 }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </div>
              )}
            </Button>
          );
        })(),
      }))
    );
    /* eslint-disable */
  }, [
    // accountStore.address,
    accountStore.balances,
    isConnected,
    settingsStore,
    vm.loading,
    pricesStore.tokensPrices,
  ]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Asset',
        accessor: 'asset',
      },
      {
        Header: 'Mint amount',
        accessor: 'amount',
      },
      {
        Header: 'My balance',
        accessor: 'balance',
      },
      {
        Header: ' ',
        accessor: 'btn',
      },
    ],
    []
  );
  return (
    <Scrollbar style={{ maxWidth: 'calc(100vw - 32px)', borderRadius: 16 }}>
      <Table
        columns={columns}
        data={tokens}
        style={{
          whiteSpace: 'nowrap',
          width: 'fitContent',
          minWidth: 'fit-content',
        }}
      />
    </Scrollbar>
  );
};
export default observer(TokensFaucetTable);
