import {useQuery} from "@tanstack/react-query";
import {useAccount} from "@fuels/react";
import {toBech32} from "fuels";
import {ApiBaseUrl} from "@shared/src/utils/constants";
import useSHA256Hash from "@shared/src/hooks/useSHA256Hash";
throw error()
type SignatureData = {
  msg_hash: string;
  timestamp: number;
};

const useSavedSignatures = (message: string) => {
  const {account} = useAccount();

  const address = account !== null ? toBech32(account) : null;
  const {hash} = useSHA256Hash(message);

  const {data, isLoading, refetch} = useQuery({
    queryKey: ["signatures", address],
    queryFn: async () => {
      const response = await fetch(
        `${ApiBaseUrl}/signature?address=${address}&msg_hash=${hash}`,
      );
      if (response.status === 404) {
        return null;
      }

      const data: SignatureData = await response.json();
      return data;
    },
    enabled: Boolean(address),
  });

  return {
    signatureData: data,
    isSignatureLoading: isLoading,
    refetchSignature: refetch,
  };
};

export default useSavedSignatures;
