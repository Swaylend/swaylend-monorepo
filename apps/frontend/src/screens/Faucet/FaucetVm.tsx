import { Row } from '@src/components/Flex';
import Spinner from '@src/components/Spinner';
import Text from '@src/components/Text';
import {
  EXPLORER_URL,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
} from '@src/constants';
import { TokenAbi__factory } from '@src/contract-types';
import { useVM } from '@src/hooks/useVM';
import BN from '@src/utils/BN';
import centerEllipsis from '@src/utils/centerEllipsis';
import { errorToMessage } from '@src/utils/errorMessage';
import { type RootStore, useStores } from '@stores';
import { hashMessage } from 'fuels';
import { makeAutoObservable } from 'mobx';
import React, { useMemo } from 'react';
import { toast } from 'react-toastify';

const ctx = React.createContext<FaucetVM | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const FaucetVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new FaucetVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useFaucetVM = () => useVM(ctx);

const faucetAmounts: Record<string, number> = {
  ETH: 0.5,
  LINK: 50,
  UNI: 50,
  BTC: 0.01,
  USDC: 300,
  COMP: 5,
};

class FaucetVM {
  public rootStore: RootStore;

  loading = false;
  private _setLoading = (l: boolean) => {
    this.loading = l;
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  rejectUpdateStatePromise?: () => void;
  setRejectUpdateStatePromise = (v: any) => {
    this.rejectUpdateStatePromise = v;
  };

  actionTokenAssetId: string | null = null;
  setActionTokenAssetId = (l: string | null) => {
    this.actionTokenAssetId = l;
  };

  initialized = true;

  get faucetTokens() {
    const { accountStore, pricesStore } = this.rootStore;
    if (accountStore.assetBalances == null) return [];
    return TOKENS_LIST.filter((t) => t.symbol !== 'SWAY').map((b) => {
      const balance = accountStore.findBalanceByAssetId(b.assetId);
      const price =
        pricesStore.tokensPrices != null
          ? pricesStore.tokensPrices[b.assetId]
          : BN.ZERO;
      const mintAmount = new BN(faucetAmounts[b.symbol] ?? 0);
      const mintAmountDollar = mintAmount.times(price);
      const formatBalance = BN.formatUnits(
        balance?.balance ?? BN.ZERO,
        b.decimals
      );
      const balanceDollar = formatBalance.times(price);
      return {
        ...TOKENS_BY_ASSET_ID[b.assetId],
        ...balance,
        formatBalance,
        price,
        balanceDollar,
        mintAmount,
        mintAmountDollar,
      };
    });
  }

  mint = async (assetId?: string) => {
    console.log('minting', assetId);
    if (assetId == null) return;
    // if (this.rootStore.accountStore.loginType === LOGIN_TYPE.FUEL_WALLET) {
    //   const addedAssets: Array<any> = await window?.fuel.assets();
    //   if (
    //     addedAssets != null &&
    //     !addedAssets.some((v) => v.assetId === assetId)
    //   ) {
    //     await this.addAsset(assetId);
    //   }
    // }
    this._setLoading(true);
    this.setActionTokenAssetId(assetId);
    const { accountStore, notificationStore } = this.rootStore;
    const { tokenFactory } = this.rootStore.settingsStore.currentVersionConfig;
    const wallet = await accountStore.getWallet();
    if (wallet == null) return;
    const tokenFactoryContract = TokenAbi__factory.connect(
      tokenFactory,
      wallet
    );

    try {
      const token = TOKENS_BY_ASSET_ID[assetId];
      const amount = BN.parseUnits(faucetAmounts[token.symbol], token.decimals);
      const hash = hashMessage(token.symbol);
      const userAddress = wallet.address.toB256();

      const tx = (await tokenFactoryContract.functions
        .mint({ Address: { bits: userAddress } }, hash, amount.toString())
        .call()) as any;

      const transactionResult = (await toast.promise(tx.waitForResult(), {
        pending: {
          render: (
            <Row>
              <Spinner />
              <Text
                size="small"
                type="secondary"
                className="notifications-text"
                weight={500}
                style={{ marginTop: 2, width: '100%', wordBreak: 'break-word' }}
              >
                Transaction is pending...
              </Text>
            </Row>
          ),
        },
      })) as any;

      if (transactionResult != null) {
        const token = TOKENS_BY_ASSET_ID[assetId];
        if (token !== TOKENS_BY_SYMBOL.ETH) {
          this.rootStore.settingsStore.addMintedToken(assetId);
        }
        const txId = transactionResult.id ?? '';
        this.rootStore.notificationStore.toast(
          `You have successfully minted ${token.symbol}`,
          {
            link: `${EXPLORER_URL}/tx/${txId}`,
            linkTitle: 'View on Explorer',
            type: 'success',
            copyTitle: `Copy tx id: ${centerEllipsis(txId, 8)}`,
            copyText: transactionResult.id,
            title: 'Transaction is completed!',
          }
        );
      } else {
        notificationStore.toast('Transaction Failed', {
          type: 'error',
          title: 'Transaction Failed',
        });
      }
      await this.rootStore.accountStore.updateAccountBalances();
    } catch (e) {
      const errorText = e?.toString();
      console.log(errorText);
      notificationStore.toast(errorText!, {
        type: 'error',
        title: errorToMessage(errorText ?? ''),
      });
    } finally {
      this.setActionTokenAssetId(null);
      this._setLoading(false);
    }
  };

  addAsset = async (assetId: string) => {
    if (assetId === TOKENS_BY_SYMBOL.ETH.assetId || window.fuel == null) return;
    const token = TOKENS_BY_ASSET_ID[assetId];
    const asset = {
      name: token.name,
      decimals: token.decimals,
      assetId: token.assetId,
      imageUrl: window.location.origin + token.logo,
      symbol: token.symbol,
      isCustom: true,
    };
    return window?.fuel.addAsset(asset);
  };
}
