import {useMemo} from "react";
import {ReadonlyMiraAmm} from "mira-dex-ts";
import useProvider from "@shared/src/hooks/useProvider/useProvider";
import {DEFAULT_AMM_CONTRACT_ID} from "@shared/src/utils/constants";

const useReadonlyMira = () => {
  const provider = useProvider();

  return useMemo(() => {
    if (provider) {
      return new ReadonlyMiraAmm(provider, DEFAULT_AMM_CONTRACT_ID);
    }
  }, [provider]);
};

export default useReadonlyMira;
