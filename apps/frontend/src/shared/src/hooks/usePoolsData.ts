import {useQuery} from "@tanstack/react-query";
import {CoinName} from "@shared/src/utils/coinsConfig";
import {SQDIndexerUrl} from "@shared/src/utils/constants";
import request, {gql} from "graphql-request";
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
throw error()
export type PoolData = {
  id: string;
  reserve_0: string;
  reserve_1: string;
  details: {
    asset0Id: string;
    asset1Id: string;
    asset_0_symbol: CoinName;
    asset_1_symbol: CoinName;
    apr: number | null;
    volume: string;
    tvl: number;
  };
  swap_count: number;
  create_time: number;
};

export type MoreInfo = {
  totalCount: number;
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
  orderBy: string;
  setOrderBy: (orderBy: string) => void;
  search: string;
  setSearch: (search: string) => void;
};

export type PoolsData = {
  pools: PoolData[];
};
const ITEMS_IN_PAGE = 10;
const DEFAULT_ORDER_BY = "tvlUSD_DESC";
const DEFAULT_SEARCH = "";
export const DEFAULT_PAGE = 1;

export const usePoolsData = () => {
  const [queryVariables, setQueryVariables] = useQueryParams({
    page: withDefault(NumberParam, DEFAULT_PAGE),
    search: withDefault(StringParam, DEFAULT_SEARCH),
    orderBy: withDefault(StringParam, DEFAULT_ORDER_BY),
  });

  const {page, search, orderBy} = queryVariables;

  const timestamp24hAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  const query = gql`
    query PoolsConnection($first: Int!, $after: String, $orderBy: [PoolOrderByInput!]!, $poolWhereInput: PoolWhereInput) {
      poolsConnection(first: $first, after: $after, orderBy: $orderBy, where: $poolWhereInput ) {
        totalCount
        totalCount
        edges {
            node {
              id
              reserve0Decimal
              reserve1Decimal
              tvlUSD
              asset1 {
                id
                symbol
              }
              asset0 {
                id
                symbol
              }
              snapshots(where: { timestamp_gt: ${timestamp24hAgo} }) {
                volumeUSD
                feesUSD
              }
            }
        }
    }
    }
  `;

  const {data, isLoading} = useQuery<any>({
    queryKey: ["pools", page, orderBy, search],
    queryFn: () =>
      request({
        url: SQDIndexerUrl,
        document: query,
        variables: {
          first: ITEMS_IN_PAGE,
          after: page === 1 ? null : String((page - 1) * ITEMS_IN_PAGE),
          orderBy,
          poolWhereInput: {
            OR: [
              {asset0: {symbol_containsInsensitive: search}},
              {asset1: {symbol_containsInsensitive: search}},
              {asset0: {id_containsInsensitive: search}},
              {asset1: {id_containsInsensitive: search}},
            ],
          },
        },
      }),
  });

  const totalPages = Math.ceil(
    data?.poolsConnection?.totalCount / ITEMS_IN_PAGE,
  );

  const dataTransformed = data?.poolsConnection?.edges.map(
    (poolNode: any): PoolData => {
      const pool = poolNode.node;
      // const volume24h = pool.snapshots.reduce((acc: number, snapshot: any) => acc + parseFloat(snapshot.volumeUSD), 0);
      const fees24h = pool.snapshots.reduce(
        (acc: number, snapshot: any) => acc + parseFloat(snapshot.feesUSD),
        0,
      );
      const apr = (fees24h / parseFloat(pool.tvlUSD)) * 365 * 100;

      return {
        id: pool.id,
        reserve_0: pool.reserve0Decimal,
        reserve_1: pool.reserve1Decimal,
        details: {
          asset0Id: pool.asset0.id,
          asset1Id: pool.asset1.id,
          asset_0_symbol: pool.asset0.symbol as CoinName,
          asset_1_symbol: pool.asset1.symbol as CoinName,
          apr,
          volume: pool.snapshots.reduce(
            (acc: number, snapshot: any) =>
              acc + parseFloat(snapshot.volumeUSD),
            0,
          ),
          tvl: parseFloat(pool.tvlUSD),
        },
        swap_count: 0,
        create_time: 0,
      };
    },
  );

  const totalCount = data?.poolsConnection?.totalCount || 0;

  return {
    data: dataTransformed,
    isLoading,
    moreInfo: {
      totalCount,
      totalPages,
      setQueryVariables,
      queryVariables,
    },
  };
};

export default usePoolsData;
