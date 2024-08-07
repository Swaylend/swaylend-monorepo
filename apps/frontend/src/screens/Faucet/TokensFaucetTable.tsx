import Button from '@components/Button';
import { Column, Row } from '@components/Flex';
import Loading from '@components/Loading';
import Scrollbar from '@components/Scrollbar';
import SizedBox from '@components/SizedBox';
import Table from '@components/Table';
import Text from '@components/Text';
import TokenIcon from '@components/TokenIcon';
import { useFaucetVM } from '@screens/Faucet/FaucetVm';
import { FAUCET_URL, TOKENS_BY_SYMBOL } from '@src/constants';
import { useStores } from '@stores';
import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';

type IProps = any;

const TokensFaucetTable: React.FC<IProps> = () => {
  const { accountStore, settingsStore, pricesStore } = useStores();
  const vm = useFaucetVM();
  const [tokens, setTokens] = useState<any>([]);
  const ethBalance = accountStore.getBalance(TOKENS_BY_SYMBOL.ETH);
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
                $ {t.price.toFormat(2)}
              </Text>
            </Column>
          </Row>
        ),
        amount: (
          <Column crossAxisSize="max">
            <Text fitContent style={{ whiteSpace: 'nowrap' }} weight={500}>
              {`${t.mintAmount.toFormat()} ${t.symbol}`}
            </Text>
            <Text fitContent style={{ whiteSpace: 'nowrap' }} type="secondary">
              $ {t.mintAmountDollar.toFormat(2)}
            </Text>
          </Column>
        ),
        balance: (
          <Column crossAxisSize="max">
            <Text fitContent style={{ whiteSpace: 'nowrap' }} weight={500}>
              {`${t.formatBalance?.toFormat(2)} ${t.symbol}`}
            </Text>
            <Text fitContent style={{ whiteSpace: 'nowrap' }} type="secondary">
              $ {t.balanceDollar.toFormat(2)}
            </Text>
          </Column>
        ),
        btn: (() => {
          if (!accountStore.isLoggedIn && t.symbol !== 'ETH')
            return (
              <Button
                fixed
                onClick={() => settingsStore.setLoginModalOpened(true)}
              >
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
          if (ethBalance?.eq(0) && t.symbol !== 'ETH')
            return (
              <Button fixed onClick={() => vm.mint(t.assetId)}>
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
                  window.open(
                    `${FAUCET_URL}/?address=${accountStore.address}`,
                    'blank'
                  );
                } else {
                  vm.mint(t.assetId);
                }
              }}
            >
              {vm.loading && vm.actionTokenAssetId === t.assetId ? (
                <Loading />
              ) : (
                'Mint'
              )}
            </Button>
          );
        })(),
      }))
    );
    /* eslint-disable */
  }, [
    accountStore.address,
    accountStore.balances,
    accountStore.isLoggedIn,
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
