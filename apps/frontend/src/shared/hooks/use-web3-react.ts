import {
    useAccount,
    useConnectUI,
    useDisconnect,
    useIsConnected,
  } from "@fuels/react";
  import {useMemo} from "react";
  
  const useWeb3React = () => {
    const {isConnected, isFetching} = useIsConnected();
    const {connect, isConnecting, connectors} = useConnectUI();
    const {disconnect, isPending: disconnectLoading} = useDisconnect();
    const {account} = useAccount();
  
    const isAdapterLoading = useMemo(() => {
      // Adapter is loading if:
      // 1. The connection status is being fetched or refetching (`isFetching`).
      // 2. No connectors are available yet (`connectors.length === 0`).
      // 3. No account is loaded (`!account`).
      return isFetching && connectors.length === 0 && !account;
    }, [isFetching, connectors, account]);
  
    const isWalletLoading = useMemo(() => {
      // Wallet is loading if:
      // 1. A connection attempt is in progress (`isConnecting`).
      // 2. A disconnection attempt is in progress (`disconnectLoading`).
      // 3. The adapter is still loading (`isAdapterLoading`).
      return isConnecting || disconnectLoading || isAdapterLoading;
    }, [isConnecting, disconnectLoading, isAdapterLoading]);
  
    return {
      isConnected,
      isWalletLoading,
      connect,
      disconnect,
      account,
      connectors,
    };
  };
  
  export default useWeb3React;
  