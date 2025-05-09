import src20Abi from "@shared/src/abis/src20-abi.json";
import {useQuery} from "@tanstack/react-query";
import {B256Address, Contract, Provider} from "fuels";
import {NetworkUrl} from "../utils/constants";
import {useAssetList} from "./useAssetList";
import {useAssetMinterContract} from "./useAssetMinterContract";

interface AssetMetadata {
  name?: string;
  symbol?: string;
  decimals?: number;
}

const providerPromise = new Provider(NetworkUrl);

const useAssetMetadata = (
  assetId: B256Address | null,
): AssetMetadata & {isLoading: boolean} => {
  const {assets} = useAssetList();

  const {contractId, isLoading: contractLoading} =
    useAssetMinterContract(assetId);

  const {data, isLoading: metadataLoading} = useQuery({
    queryKey: ["assetMetadata", contractId, assetId],
    queryFn: async () => {
      const asset = assets.find(
        (asset) => asset.assetId.toLowerCase() === assetId?.toLowerCase(),
      );

      // first check if asset in the already fetched list
      if (asset) {
        return {
          name: asset.name,
          symbol: asset.symbol,
          decimals: asset.decimals,
        };
      }

      const provider = await providerPromise;
      const src20Contract = new Contract(contractId!, src20Abi, provider);

      const result = await src20Contract
        .multiCall([
          src20Contract.functions.name({bits: assetId}),
          src20Contract.functions.symbol({bits: assetId}),
          src20Contract.functions.decimals({bits: assetId}),
        ])
        .addContracts([
          // The current bridge implementation
          new Contract(
            "0x0ceafc5ef55c66912e855917782a3804dc489fb9e27edfd3621ea47d2a281156",
            src20Abi,
            provider!,
          ),
        ])
        .get();

      return {
        name: result.value[0],
        symbol: result.value[1],
        decimals: result.value[2],
      };
    },
    enabled: !!assetId && !!contractId,
    staleTime: Infinity,
  });

  const isLoading = contractLoading || metadataLoading;

  return data
    ? {...data, isLoading}
    : {name: undefined, symbol: undefined, decimals: undefined, isLoading};
};

export default useAssetMetadata;
