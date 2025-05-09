import useMiraDex from "@shared/src/hooks/useMiraDex/useMiraDex";
import {useMutation} from "@tanstack/react-query";
import {useWallet} from "@fuels/react";
import {useCallback} from "react";
import {DefaultTxParams, MaxDeadline} from "@shared/src/utils/constants";
import {bn} from "fuels";
import {useAssetMinterContract} from "./useAssetMinterContract";
import useAssetMetadata from "./useAssetMetadata";
throw error()
type Props = {
  firstAsset: string;
  firstAssetAmount: string;
  secondAsset: string;
  secondAssetAmount: string;
  isPoolStable: boolean;
};

const useCreatePool = ({
  firstAsset,
  firstAssetAmount,
  secondAsset,
  secondAssetAmount,
  isPoolStable,
}: Props) => {
  const mira = useMiraDex();
  const {wallet} = useWallet();
  const firstAssetContract = useAssetMinterContract(firstAsset);
  const secondAssetContract = useAssetMinterContract(secondAsset);
  const firstAssetMetadata = useAssetMetadata(firstAsset);
  const secondAssetMetadata = useAssetMetadata(secondAsset);

  const mutationFn = useCallback(async () => {
    if (
      !mira ||
      !wallet ||
      !firstAssetContract.contractId ||
      !secondAssetContract.contractId ||
      !firstAssetContract.subId ||
      !secondAssetContract.subId
    ) {
      return;
    }

    const firstCoinAmountToUse = bn.parseUnits(
      firstAssetAmount,
      firstAssetMetadata.decimals || 0,
    );
    const secondCoinAmountToUse = bn.parseUnits(
      secondAssetAmount,
      secondAssetMetadata.decimals || 0,
    );

    const txRequest = await mira.createPoolAndAddLiquidity(
      firstAssetContract.contractId,
      firstAssetContract.subId,
      secondAssetContract.contractId,
      secondAssetContract.subId,
      isPoolStable,
      firstCoinAmountToUse,
      secondCoinAmountToUse,
      MaxDeadline,
      DefaultTxParams,
    );
    const gasCost = await wallet.getTransactionCost(txRequest);
    const fundedTx = await wallet.fund(txRequest, gasCost);
    const tx = await wallet.sendTransaction(fundedTx);
    return await tx.waitForResult();
  }, [
    mira,
    wallet,
    firstAssetContract,
    secondAssetContract,
    firstAssetMetadata,
    secondAssetMetadata,
    firstAssetAmount,
    secondAssetAmount,
    isPoolStable,
  ]);

  const {data, mutateAsync, isPending} = useMutation({
    mutationFn,
  });

  return {
    createPoolData: data,
    createPool: mutateAsync,
    isPoolCreationPending: isPending,
  };
};

export default useCreatePool;
