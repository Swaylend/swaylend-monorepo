import Image from 'next/image';
import { useMemo, useState } from 'react';
import { appConfig } from '@/configs';
import {
  TX_HISTORY_PAGE_SIZE,
  useLiquidationHistory,
  useTotalTransactionCount,
  useTransactionHistory,
} from '@/hooks/v2';
import { SYMBOL_TO_ICON, SYMBOL_TO_NAME } from '@/utils';
import { Skeleton } from '../../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { AssetName } from '../asset-name';

const SkeletonRow = (
  <TableRow>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
  </TableRow>
);

export const History = () => {
  const [page, setPage] = useState<number>(1);
  const { data: transactionHistory, isPending: isPendingTxHistory } =
    useTransactionHistory(page);
  const { data: liquidationHistory, isPending: isPendingLqHistory } =
    useLiquidationHistory();
  const { data: totalTransactionCount, isPending: isPendingTxCount } =
    useTotalTransactionCount();

  const isLoading = useMemo(() => {
    return isPendingTxHistory || isPendingTxCount;
  }, [isPendingTxHistory, isPendingTxCount]);

  const totalPages = useMemo(() => {
    if (!totalTransactionCount) {
      return 1;
    }

    return Math.ceil(totalTransactionCount / TX_HISTORY_PAGE_SIZE);
  }, [totalTransactionCount]);

  return (
    <div>
      <Table className="max-lg:hidden">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={8}>
              <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-white">
                My Transactions
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Market
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Type
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Asset
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Amount
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              TX ID
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            SkeletonRow
          ) : totalTransactionCount > 0 ? (
            <>
              {transactionHistory?.map((tx: any) => {
                console.log('tx.market', tx.market);
                console.log(
                  'SYMBOL_TO_ICON[tx.market]',
                  SYMBOL_TO_ICON[tx.market]
                );

                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-moon">
                      <div className="flex items-center gap-x-2">
                        <div>
                          <Image
                            alt={tx.market}
                            className={'rounded-full'}
                            height={32}
                            src={SYMBOL_TO_ICON[tx.market]}
                            width={32}
                          />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-x-2">
                            <div className="font-semibold text-md text-white">
                              {SYMBOL_TO_NAME[tx.market]}
                            </div>
                            <div className="font-semibold text-moon text-sm">
                              {tx.market}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-lavender text-md">
                      {tx.eventType === 'Withdrawal'
                        ? 'Withdraw'
                        : tx.eventType}
                    </TableCell>
                    <TableCell className="text-moon">
                      <AssetName
                        name={SYMBOL_TO_NAME[tx.token]}
                        src={SYMBOL_TO_ICON[tx.token]}
                        symbol={tx.token}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-x-2">
                        <span className="font-medium text-lavender">
                          $ {tx.amountUsd}
                        </span>
                        <span>
                          {Number.parseFloat(tx.amount).toFixed(2)} {tx.token}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-moon">
                      <div>
                        <a
                          className="cursor-pointer font-normal text-primary underline hover:opacity-80"
                          href={`${appConfig.client.shared.fuelExplorerUrl}/tx/${tx.transactionHash}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {`${tx.transactionHash.slice(0, 8)}...${tx.transactionHash.slice(-4)}`}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-lavender">{tx.date}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-md text-moon">
                    <button
                      onClick={() => setPage(page > 1 ? page - 1 : 1)}
                      type="button"
                    >
                      {'<'}
                    </button>
                    Page {page} of {totalPages}
                    <button
                      onClick={() =>
                        setPage(page < totalPages ? page + 1 : totalPages)
                      }
                      type="button"
                    >
                      {'>'}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex w-full items-center justify-center font-semibold text-md text-moon">
                  No Transactions
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Table className="mt-12 max-lg:hidden">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={8}>
              <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-white">
                Liquidated Positions
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Market
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Event Type
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              TX ID
            </TableHead>
            <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPendingLqHistory ? (
            <TableRow>
              <TableCell>
                <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
              </TableCell>
            </TableRow>
          ) : liquidationHistory && liquidationHistory.length > 0 ? (
            liquidationHistory?.map((tx: any) => (
              <TableRow key={tx.id}>
                <TableCell className="text-moon">
                  <div className="flex items-center gap-x-2">
                    <div>
                      <Image
                        alt={tx.market}
                        className={'rounded-full'}
                        height={32}
                        src={SYMBOL_TO_ICON[tx.market]}
                        width={32}
                      />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-x-2">
                        <div className="font-semibold text-md text-white">
                          {SYMBOL_TO_NAME[tx.market]}
                        </div>
                        <div className="font-semibold text-moon text-sm">
                          {tx.market}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-md text-red-500">
                  Liquidation
                </TableCell>
                <TableCell className="text-moon">
                  <div>
                    <a
                      className="cursor-pointer font-normal text-primary underline hover:opacity-80"
                      href={`${appConfig.client.shared.fuelExplorerUrl}/tx/${tx.transactionHash}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {`${tx.transactionHash.slice(0, 8)}...${tx.transactionHash.slice(-4)}`}
                    </a>
                  </div>
                </TableCell>
                <TableCell className="text-lavender">{tx.date}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex w-full items-center justify-center font-semibold text-md text-moon">
                  No Liquidations
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
