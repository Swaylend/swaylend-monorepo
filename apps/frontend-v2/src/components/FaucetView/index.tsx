import {
  useConnectUI,
  useFuel,
  useDisconnect,
  useIsConnected,
  useWallet,
  useAccount,
  useAccounts,
} from '@fuels/react';
import React, { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import useBalance from '@/hooks/useBalance';
import useBalances from '@/hooks/useBalances';
import { BN } from 'fuels';

export const FAUCET_URL = 'https://faucet-testnet.fuel.network/';
const FAUCET_TOKENS = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 9,
    assetId:
      '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
  },
  {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    assetId:
      '0xb5a7ec61506d83f6e4739be2dc57018898b1e08684c097c73b582c9583e191e2',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    assetId:
      '0x00dc5cda67b6a53b60fa53f95570fdaabb5b916c0e6d614a3f5d9de68f832e61',
  },
  {
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 9,
    assetId:
      '0xf7c5f807c40573b5db88e467eb9aabc42332483493f7697442e1edbd59e020ad',
  },
];
const FAUCET_AMOUNTS: Record<string, number> = {
  UNI: 50,
  BTC: 1,
  USDC: 300,
};

export const FaucetView = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingToken, setMintingToken] = useState<string>('');
  const { connect, error, isError, theme, isConnecting } = useConnectUI();
  const { fuel } = useFuel();
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { accounts } = useAccounts();

  const etherBalance = useBalance(FAUCET_TOKENS[0].assetId);
  const balances = useBalances(FAUCET_TOKENS.map((t) => t.assetId));
  console.log(balances);

  const mint = async (assetId: string, decimals: any, symbol: string) => {
    setIsMinting(true);
    setMintingToken(assetId);
    console.log(symbol);
    const amount = new BN(FAUCET_AMOUNTS[symbol]).mul(10 ** decimals);
    console.log(amount.toString());
    setIsMinting(false);
    setMintingToken('');
  };

  return (
    <div>
      {FAUCET_TOKENS.map((token) => {
        return (
          <div key={token.assetId} className="flex gap-x-4">
            <div>{token.name}</div>
            <div>
              {balances[token.assetId].formatUnits(token.decimals).toString()}{' '}
              {token.symbol}
            </div>
            <Button
              disabled={
                !isConnected ||
                (isMinting && mintingToken !== token.assetId) ||
                (etherBalance.eq(0) && token.symbol !== 'ETH')
              }
              onClick={() => {
                if (token.symbol === 'ETH') {
                  window.open(`${FAUCET_URL}/?address=${account}`, 'blank');
                } else {
                  mint(token.assetId, token.decimals, token.symbol);
                }
              }}
            >
              Mint
            </Button>
          </div>
        );
      })}
    </div>
  );
};
