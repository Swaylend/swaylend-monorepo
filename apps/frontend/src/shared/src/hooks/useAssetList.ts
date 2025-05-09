import request, {gql} from "graphql-request";
import {SQDIndexerUrl} from "../utils/constants";
import {useQuery} from "@tanstack/react-query";
import {CoinDataWithPrice, coinsConfig} from "../utils/coinsConfig";

export const useAssetList = (): {
  assets: CoinDataWithPrice[];
  isLoading: boolean;
} => {

  const {data, isLoading} = useQuery<any>({
    queryKey: ["assets"],
    queryFn: async () => {
      const query = gql`
        query MyQuery {
          assets(where: {numPools_gt: 0}) {
            image
            name
            symbol
            id
            decimals
            numPools
            l1Address
            price
            contractId
            subId
          }
        }
      `;

      const results = await request<{assets: any}>({
        url: SQDIndexerUrl,
        document: query,
      });

      const assets = results.assets.map((asset: any): CoinDataWithPrice => {
        const config = coinsConfig.get(asset.id);

        return {
          assetId: asset.id,
          name: config?.name || asset.name,
          symbol: config?.symbol || asset.symbol,
          decimals: asset.decimals,
          icon: config?.icon || asset.image,
          l1Address: asset.l1Address,
          contractId: asset.contractId,
          subId: asset.subId,
          price: asset.price,
          isVerified: config?.isVerified || false,
        };
      });

      return assets;
    },
    staleTime: Infinity,
    meta: {persist: true},
  });

  return {assets: data, isLoading};
};
