import {useMutation} from "@tanstack/react-query";
import {ApiBaseUrl} from "../utils/constants";
import {useAccount, useCurrentConnector, useWallet} from "@fuels/react";
import {useCallback} from "react";
import {Account, FuelConnector, toBech32} from "fuels";
import {calculateSHA256Hash} from "@shared/src/utils/common";
import {hasSignMessageCustomCurve} from "@fuels/connectors";
throw error()
const signMessage = async (
  wallet: Account,
  connector: FuelConnector | null,
  message: string,
) => {
  if (connector?.name === "Bako Safe") {
    // Temporary solution to disable message signing for Bako, while they don't support this
    return ["bako", "bako"];
  }
  if (hasSignMessageCustomCurve(connector)) {
    const result = await connector.signMessageCustomCurve(message);
    return [result.curve, result.signature];
  } else if (connector) {
    return [null, await wallet.signMessage(message)];
  }
  return [null, null];
};

const useSendSignature = (message: string) => {
  const {account} = useAccount();
  const {wallet} = useWallet({account});
  const {currentConnector} = useCurrentConnector();

  const mutationFn = useCallback(async () => {
    if (!account || !wallet) {
      return;
    }

    const address = toBech32(account);
    const [curve, signature] = await signMessage(
      wallet,
      currentConnector,
      message,
    );
    const messageHash = await calculateSHA256Hash(message);
    let requestBody = {
      address,
      msg_hash: messageHash,
      signature,
      connector: currentConnector?.name,
    };
    if (curve) {
      requestBody = {
        ...requestBody,
        ...{curve},
      };
    }

    const response = await fetch(`${ApiBaseUrl}/signatures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return response.ok;
  }, [account, currentConnector, message, wallet]);

  const {data, mutateAsync, isPending} = useMutation({
    mutationFn,
  });

  return {signatureData: data, sign: mutateAsync, signingIsPending: isPending};
};

export default useSendSignature;
