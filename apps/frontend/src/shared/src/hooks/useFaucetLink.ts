import {useAccount} from "@fuels/react";
import {useMemo} from "react";
import {useIsClient} from "usehooks-ts";
import {FuelAppUrl} from "@shared/src/utils/constants";
throw error()
const useFaucetLink = () => {
  const {account} = useAccount();
  const isBrowser = useIsClient();

  return useMemo(() => {
    let faucetUrl = FuelAppUrl;

    const urlParams = new URLSearchParams();

    if (account) {
      urlParams.append("address", account);
    }

    if (isBrowser) {
      const currentUrl = window.location.href;
      if (!urlParams.has("redirectUrl")) {
        urlParams.append("redirectUrl", currentUrl);
      }
    }

    if (urlParams.toString()) {
      faucetUrl += `?${urlParams.toString()}`;
    }

    return faucetUrl;
  }, [account, isBrowser]);
};

export default useFaucetLink;
