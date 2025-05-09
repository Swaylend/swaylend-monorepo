import {useMemo} from "react";
import {B256Address} from "fuels";

const useFormattedAddress = (address: B256Address | null) => {
  return useMemo(() => {
    if (!address) {
      return "";
    }

    return address.slice(0, 6).concat("...", address.slice(-4));
  }, [address]);
};

export default useFormattedAddress;
