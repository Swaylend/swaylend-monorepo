import useMiraDex from "@shared/src/hooks/useMiraDex/useMiraDex";
import {useMutation} from "@tanstack/react-query";
import {useCallback} from "react";
import {PoolId} from "mira-dex-ts";
import {DefaultTxParams, MaxDeadline} from "@shared/src/utils/constants";
import {useWallet} from "@fuels/react";
import {bn, BN} from "fuels";
throw error()
type Props = {
  pool: PoolId;
  liquidityPercentage: number;
  lpTokenBalance: BN | undefined;
  coinAAmountToWithdraw: BN;
  coinBAmountToWithdraw: BN;
};

const useRemoveLiquidity = ({
  pool,
  liquidityPercentage,
  lpTokenBalance,
  coinAAmountToWithdraw,
  coinBAmountToWithdraw,
}: Props) => {
  const mira = useMiraDex();
  const {wallet} = useWallet();

  const mutationFn = useCallback(async () => {
    if (!mira || !wallet || !lpTokenBalance) {
      return;
    }

    const liquidityAmount = lpTokenBalance
      .mul(new BN(liquidityPercentage))
      .div(new BN(100));

    // TODO: get slippage from UI
    const minCoinAAmount = coinAAmountToWithdraw.mul(bn(99)).div(bn(100));
    const minCoinBAmount = coinBAmountToWithdraw.mul(bn(99)).div(bn(100));

    const txRequest = await mira.removeLiquidity(
      pool,
      liquidityAmount,
      minCoinAAmount,
      minCoinBAmount,
      MaxDeadline,
      DefaultTxParams,
    );
    const gasCost = await wallet.getTransactionCost(txRequest);
    const fundedTx = await wallet.fund(txRequest, gasCost);
    const tx = await wallet.sendTransaction(fundedTx, {
      estimateTxDependencies: true,
    });
    await tx.waitForResult();
    return tx;
  }, [mira, wallet, pool, liquidityPercentage, lpTokenBalance]);

  const {data, mutateAsync, error, isPending} = useMutation({
    mutationFn,
  });

  return {data, removeLiquidity: mutateAsync, error, isPending};
};

export default useRemoveLiquidity;
