import {useWallet} from "@fuels/react";
import {MiraAmm} from "mira-dex-ts";
import {useMemo} from "react";
import {DEFAULT_AMM_CONTRACT_ID} from "@shared/src/utils/constants";

const useMiraDex = () => {
  const {wallet} = useWallet();

  return useMemo(() => {
    if (wallet) {
      return new MiraAmm(wallet, DEFAULT_AMM_CONTRACT_ID);
    }
  }, [wallet]);
};

export default useMiraDex;
