import {gql, request} from "graphql-request";
import {useQuery} from "@tanstack/react-query";
import {B256Address} from "fuels";
import {DefaultLocale, IndexerUrl} from "@shared/src/utils/constants";
import {useMemo} from "react";
import {CoinDataWithPrice} from "../utils/coinsConfig";
import {useAssetList} from "./useAssetList";

export type TransactionFromQuery = {
  tx_id: string;
  asset_0_in: string;
  asset_0_out: string;
  asset_1_in: string;
  asset_1_out: string;
  block_time: number;
  pool_id: string;
  transaction_type: "ADD_LIQUIDITY" | "REMOVE_LIQUIDITY" | "SWAP";
  extra: string;
  // is_contract_initiator: boolean;
  // initiator: B256Address;
};

export type TransactionsDataFromQuery = {
  Transaction: TransactionFromQuery[];
};

export type Transaction = Omit<TransactionFromQuery, "extra"> & {
  extra: Transaction[];
};

export type TransactionsData = {
  Transaction: Transaction[];
};

type AssetsAmounts = {
  firstAssetAmount: string;
  secondAssetAmount: string;
  firstAsset: CoinDataWithPrice;
  secondAsset: CoinDataWithPrice;
  reversedAssetsOrder: boolean;
};

interface TransactionProps extends AssetsAmounts {
  date: string;
  name: string;
  firstAssetAmount: string;
  secondAssetAmount: string;
  withdrawal?: boolean;
  addLiquidity?: boolean;
  tx_id: string;
}

const transformTransactionsDataAndGroupByDate = (
  transactionsData: TransactionsData,
  assets: CoinDataWithPrice[],
): Record<string, TransactionProps[]> => {
  const grouped: Record<string, TransactionProps[]> = {};

  // Sort transactions by block time (newest first)
  const transactions = transactionsData.Transaction.toSorted(
    (txA, txB) => txB.block_time - txA.block_time,
  );

  transactions.forEach((transaction) => {
    // Format the date
    const date = formatDate(transaction.block_time);

    // Calculate asset amounts
    const assetAmounts = calculateAssetAmounts(transaction, assets);

    if (!assetAmounts) return;

    // Create the transaction object
    const transformedTransaction = createTransactionObject(
      transaction,
      date,
      assetAmounts,
    );

    // Add to grouped results
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transformedTransaction);
  });

  return grouped;
};

// Helper function to format the date
const formatDate = (blockTime: number): string => {
  return new Date(blockTime * 1000).toLocaleDateString(DefaultLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper function to find assets involved in transaction
const getTransactionAssets = (
  transaction: Transaction,
  assets: CoinDataWithPrice[],
): [CoinDataWithPrice | undefined, CoinDataWithPrice | undefined] => {
  const [firstAssetId, secondAssetId] = transaction.pool_id.split("_");

  const firstAsset = assets.find(
    (asset) => asset.assetId.toLowerCase() === firstAssetId.toLowerCase(),
  );

  const secondAsset = assets.find(
    (asset) => asset.assetId.toLowerCase() === secondAssetId.toLowerCase(),
  );

  return [firstAsset, secondAsset];
};

// Helper function to calculate asset amounts
const calculateAssetAmounts = (
  transaction: Transaction,
  assets: CoinDataWithPrice[],
) => {
  const [firstAsset, secondAsset] = getTransactionAssets(transaction, assets);
  if (!firstAsset || !secondAsset) {
    return; // Skip if assets not found
  }
  const firstAssetDecimals = firstAsset.decimals;
  const secondAssetDecimals = secondAsset.decimals;

  let toAssetInIntemediateSwap: CoinDataWithPrice | undefined;
  let toAssetAmountOutInIntemediateSwap: number | undefined;

  // Calculate raw values
  const firstAssetIn =
    Number(transaction.asset_0_in) / 10 ** firstAssetDecimals;
  const firstAssetOut =
    Number(transaction.asset_0_out) / 10 ** firstAssetDecimals;
  const secondAssetIn =
    Number(transaction.asset_1_in) / 10 ** secondAssetDecimals;
  const secondAssetOut =
    Number(transaction.asset_1_out) / 10 ** secondAssetDecimals;

  if (transaction.transaction_type === "SWAP") {
    if (transaction.extra.length) {
      // Since as per the current implementation, we only do max 2 hop swap, we can take the first SWAP transaction in the array
      const intermediateSwapTransaction = transaction.extra.find(
        (eachTransaction) => eachTransaction.transaction_type === "SWAP",
      );

      if (intermediateSwapTransaction) {
        const [firstAssetInIntermediateSwap, secondAssetInIntermediateSwap] =
          getTransactionAssets(intermediateSwapTransaction, assets);
        if (!firstAssetInIntermediateSwap || !secondAssetInIntermediateSwap) {
          return; // Skip if assets not found
        }
        const reversedAssetsOrderInIntermediateSwap =
          intermediateSwapTransaction.asset_0_in == "0" &&
          intermediateSwapTransaction.asset_1_out == "0";
        toAssetInIntemediateSwap = reversedAssetsOrderInIntermediateSwap
          ? firstAssetInIntermediateSwap
          : secondAssetInIntermediateSwap;
        toAssetAmountOutInIntemediateSwap =
          reversedAssetsOrderInIntermediateSwap
            ? Number(intermediateSwapTransaction.asset_0_out) /
              10 ** toAssetInIntemediateSwap.decimals
            : Number(intermediateSwapTransaction.asset_1_out) /
              10 ** toAssetInIntemediateSwap.decimals;
      }
    }

    // Determine swap direction
    const reversedAssetsOrder =
      transaction.asset_0_in == "0" && transaction.asset_1_out == "0";

    const fromAsset = reversedAssetsOrder ? secondAsset : firstAsset;
    const toAsset = toAssetInIntemediateSwap
      ? toAssetInIntemediateSwap
      : reversedAssetsOrder
        ? firstAsset
        : secondAsset;

    const fromAssetDecimals = fromAsset.decimals;
    const toAssetDecimals = toAsset.decimals;

    // Format amounts
    const firstAssetAmount = (
      reversedAssetsOrder ? secondAssetIn : firstAssetIn
    )
      .toFixed(fromAssetDecimals)
      .replace(/\.?0+$/, "");

    const secondAssetAmount = (
      toAssetAmountOutInIntemediateSwap
        ? toAssetAmountOutInIntemediateSwap
        : reversedAssetsOrder
          ? firstAssetOut
          : secondAssetOut
    )
      .toFixed(toAssetDecimals)
      .replace(/\.?0+$/, "");

    return {
      firstAsset: fromAsset,
      secondAsset: toAsset,
      firstAssetAmount,
      secondAssetAmount,
      reversedAssetsOrder,
    };
  } else {
    // Handle ADD_LIQUIDITY and REMOVE_LIQUIDITY
    const firstAssetAmount =
      transaction.transaction_type === "ADD_LIQUIDITY"
        ? firstAssetIn.toFixed(firstAssetDecimals)
        : firstAssetOut.toFixed(firstAssetDecimals);

    const secondAssetAmount =
      transaction.transaction_type === "ADD_LIQUIDITY"
        ? secondAssetIn.toFixed(secondAssetDecimals)
        : secondAssetOut.toFixed(secondAssetDecimals);

    return {
      firstAssetAmount,
      secondAssetAmount,
      firstAsset,
      secondAsset,
      reversedAssetsOrder: false,
    };
  }
};

// Helper function to create the transaction object
const createTransactionObject = (
  transaction: Transaction,
  date: string,
  assetAmounts: AssetsAmounts,
): TransactionProps => {
  let name: string;

  if (transaction.transaction_type === "ADD_LIQUIDITY") {
    name = "Added liquidity";
  } else if (transaction.transaction_type === "REMOVE_LIQUIDITY") {
    name = "Removed liquidity";
  } else {
    name = "Swap";
  }

  return {
    ...assetAmounts,
    date,
    name,
    withdrawal: transaction.transaction_type === "REMOVE_LIQUIDITY",
    addLiquidity: transaction.transaction_type === "ADD_LIQUIDITY",
    tx_id: transaction.tx_id,
  };
};

const useWalletTransactions = (
  account: B256Address | null,
  fetchCondition: boolean,
): {
  transactions: Record<string, TransactionProps[]>;
  isLoading: boolean;
} => {
  const {assets, isLoading: isAssetsLoading} = useAssetList();

  const query = gql`
    query Transactions($owner: String, $offset: Int, $limit: Int) {
      Transaction(
        where: {initiator: {_eq: $owner}}
        offset: $offset
        limit: $limit
      ) {
        tx_id: id
        asset_0_in
        asset_0_out
        asset_1_in
        asset_1_out
        block_time
        pool_id
        transaction_type
        extra
        # is_contract_initiator
        # initiator
      }
    }
  `;

  const shouldFetch = Boolean(account) && Boolean(fetchCondition);

  const {data, isLoading} = useQuery<TransactionsDataFromQuery>({
    queryKey: ["transactions", account],
    queryFn: () =>
      request({
        url: IndexerUrl,
        document: query,
        variables: {
          owner: account?.toLowerCase(),
          limit: 200,
          offset: 0,
        },
      }),
    enabled: shouldFetch,
  });

  const transactions = useMemo(() => {
    if (!data || !assets?.length) return {};
    const transactionFormattedWithExtraField = {
      Transaction: data.Transaction.map((transaction) => ({
        ...transaction,
        extra: (transaction.extra
          ? JSON.parse(transaction.extra)
          : []) as Transaction[],
      })),
    };

    return transformTransactionsDataAndGroupByDate(
      transactionFormattedWithExtraField,
      assets,
    );
  }, [assets, data]);

  return {transactions, isLoading: isAssetsLoading || isLoading};
};

export default useWalletTransactions;
