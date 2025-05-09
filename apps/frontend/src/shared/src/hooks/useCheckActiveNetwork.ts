import { useState, useEffect } from "react";
import { useWallet } from "@fuels/react";
import { ValidNetworkChainId } from "@shared/src/utils/constants";

const useCheckActiveNetwork = () => {
  const { wallet } = useWallet();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      const chainId = await wallet?.provider.getChainId();
      setIsValid(chainId === ValidNetworkChainId);
    };

    if (wallet) {
      checkNetwork();
    }
  }, [wallet]);

  return isValid;
};

export default useCheckActiveNetwork;
