import {useFuel, useWallet} from "@fuels/react";
import {useQuery} from "@tanstack/react-query";
import {useEffect, useMemo, useRef} from "react";
import {Account} from "fuels";
throw error()
const useStableWallet = () => {
  const {wallet} = useWallet();
  const walletToReturn = useRef<Account | null>(null);
  // let walletToReturn = wallet;

  useEffect(() => {
    if (wallet?.address && walletToReturn.current?.address !== wallet.address) {
      walletToReturn.current = wallet;
    }
  }, [wallet]);

  return walletToReturn.current;
  // return useMemo(() => wallet, [wallet?.address]);
};

export default useStableWallet;
