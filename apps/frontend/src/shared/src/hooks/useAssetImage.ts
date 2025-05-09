import {skipToken, useQuery} from "@tanstack/react-query";
import request, {gql} from "graphql-request";
import {SQDIndexerUrl} from "../utils/constants";
import defaultImage from "@shared/assets/unknown-asset.svg";
import {useAssetList} from "./useAssetList";

export interface AssetImageData {
  l1Address: string;
  image: string;
}
export type AssetImageMap = Record<string, AssetImageData>;

export const useAssetImage = (assetId: string | null): string => {
  const {assets} = useAssetList();
  const {data} = useQuery<string | null>({
    queryKey: ["assetImage", assetId],
    queryFn: async () => {
      const asset = assets.find(
        (asset) => asset.assetId.toLowerCase() === assetId?.toLowerCase(),
      );
      if (asset?.icon) {
        return asset.icon;
      }

      const query = gql`
        query MyQuery {
            assetById(id: "${assetId}"){
              l1Address
              image
            }
        }`;

      const results = await request<Record<string, AssetImageData>>({
        document: query,
        url: SQDIndexerUrl,
      });

      if (results.assetById.image) {
        return results.assetById.image;
      }

      // TODO: get images from L1 address
      return null;
    },
    staleTime: Infinity,
    enabled: assetId !== null,
    meta: {persist: true},
  });

  return data || (defaultImage as any).src;
};

const buildDynamicAssetQuery = (assetIds: string[]) => {
  const queries = assetIds
    .map((id, index) => {
      return `a${index}: assetById(id: $id${index}) {
        l1Address
        image
      }`;
    })
    .join("\n");

  const variables: Record<string, string> = {};
  assetIds.forEach((id, index) => {
    variables[`id${index}`] = id;
  });

  const query = gql`
    query AssetImages(${assetIds.map((_, i) => `$id${i}: String!`).join(", ")}) {
      ${queries}
    }
  `;

  return {query, variables};
};

export const useFetchMultiAssetImages = (assetIds: string[] | undefined) => {
  return useQuery<AssetImageMap>({
    queryKey: ["asset-images", assetIds?.join("-")],
    enabled: !!assetIds && assetIds.length > 0,
    queryFn: assetIds
      ? async () => {
          const {query, variables} = buildDynamicAssetQuery(assetIds);
          const results = await request<Record<string, AssetImageData>>({
            document: query,
            url: SQDIndexerUrl,
            variables,
          });

          const assetMap: AssetImageMap = {};
          assetIds.forEach((id, index) => {
            assetMap[id] = results[`a${index}`];
          });

          return assetMap;
        }
      : skipToken,
    meta: {persist: true},
  });
};
