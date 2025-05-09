import {useCallback} from "react";
import {bn, ScriptTransactionRequest} from "fuels";
import {useWallet} from "@fuels/react";
import {useMutation} from "@tanstack/react-query";

import useMiraDex from "@shared/src/hooks/useMiraDex/useMiraDex";
import useSwapData from "@shared/src/hooks/useAssetPair/useSwapData";
import {DefaultTxParams, MaxDeadline} from "@shared/src/utils/constants";
import {PoolId} from "mira-dex-ts";
import useReadonlyMira from "../useReadonlyMira";
import {CurrencyBoxMode, SwapState} from "../../types/swap-types";

type Props = {
  swapState: SwapState;
  mode: CurrencyBoxMode;
  slippage: number;
  pools: PoolId[] | undefined;
};

const useSwap = ({swapState, mode, slippage, pools}: Props) => {
  const {wallet} = useWallet();
  const miraDex = useMiraDex();
  const readonlyMira = useReadonlyMira();
  const swapData = useSwapData(swapState);
  const {sellAssetIdInput, buyAssetIdInput, sellDecimals, buyDecimals} =
    swapData;

  const getTxCost = useCallback(async () => {
    if (!wallet || !miraDex || !pools || !readonlyMira) {
      return;
    }

    const sellAmount = bn.parseUnits(swapState.sell.amount, sellDecimals);
    const buyAmount = bn.parseUnits(swapState.buy.amount, buyDecimals);

    let tx: ScriptTransactionRequest;

    if (mode === "sell") {
      const [_buyAsset, simulatedBuyAmount] =
        await readonlyMira.previewSwapExactInput(sellAssetIdInput, sellAmount, [
          ...pools,
        ]);
      const buyAmountWithSlippage = simulatedBuyAmount
        .mul(bn(10_000).sub(bn(slippage)))
        .div(bn(10_000));
      tx = await miraDex.swapExactInput(
        sellAmount,
        sellAssetIdInput,
        buyAmountWithSlippage,
        pools,
        MaxDeadline,
        DefaultTxParams,
      );
    } else {
      const [_sellAsset, simulatedSellAmount] =
        await readonlyMira.previewSwapExactOutput(buyAssetIdInput, buyAmount, [
          ...pools,
        ]);
      const sellAmountWithSlippage = simulatedSellAmount
        .mul(bn(10_000).add(bn(slippage)))
        .div(bn(10_000));
      tx = await miraDex.swapExactOutput(
        buyAmount,
        buyAssetIdInput,
        sellAmountWithSlippage,
        pools,
        MaxDeadline,
        DefaultTxParams,
      );
    }

    const txCost = await wallet.getTransactionCost(tx);

    return {tx, txCost};
  }, [
    wallet,
    miraDex,
    swapState.buy.amount,
    sellDecimals,
    swapState.sell.amount,
    buyDecimals,
    slippage,
    mode,
    sellAssetIdInput,
    buyAssetIdInput,
    pools,
  ]);

  const sendTx = useCallback(
    async (inputTx: ScriptTransactionRequest) => {
      if (!wallet) {
        return;
      }

      const txCost = await wallet.getTransactionCost(inputTx);
      const fundedTx = await wallet.fund(inputTx, txCost);
      const tx = await wallet.sendTransaction(fundedTx, {
        estimateTxDependencies: true,
      });
      return await tx.waitForResult();
    },
    [wallet],
  );

  const {
    mutateAsync: fetchTxCost,
    data: txCostData,
    isPending: txCostPending,
    error: txCostError,
    reset: resetTxCost,
  } = useMutation({
    mutationFn: getTxCost,
  });

  const {
    mutateAsync: triggerSwap,
    data: swapResult,
    isPending: swapPending,
    error: swapError,
    reset: resetSwap,
  } = useMutation({
    mutationFn: sendTx,
  });

  return {
    fetchTxCost,
    txCostData,
    txCostPending,
    txCostError,
    triggerSwap,
    swapResult,
    swapPending,
    swapError,
    resetTxCost,
    resetSwap,
  };
};

export default useSwap;
