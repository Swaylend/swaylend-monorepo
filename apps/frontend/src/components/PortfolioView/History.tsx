import { appConfig } from '@/configs';
import {
  TX_HISTORY_PAGE_SIZE,
  useLiquidationHistory,
  useTotalTransactionCount,
  useTransactionHistory,
} from '@/hooks';
import { SYMBOL_TO_ICON, SYMBOL_TO_NAME } from '@/utils';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { AssetName } from '../AssetName';
import { InfoIcon } from '../InfoIcon';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const SkeletonRow = (
  <TableRow>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
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
      <Table className="max-lg:hidden mt-12">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={8}>
              <div className="w-full flex items-center justify-center gap-x-2 text-white font-semibold">
                Borrow Positions
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Market
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Type
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Asset
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Amount
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              TX ID
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>{SkeletonRow}</>
          ) : (
            <>
              {totalTransactionCount > 0 ? (
                <>
                  {transactionHistory?.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-moon">
                        <div className="flex gap-x-2 items-center">
                          <div>
                            <Image
                              src={SYMBOL_TO_ICON[tx.market]}
                              alt={tx.market}
                              width={32}
                              height={32}
                              className={'rounded-full'}
                            />
                          </div>
                          <div>
                            <div className="flex gap-x-2 items-baseline">
                              <div className="text-white text-md font-semibold">
                                {SYMBOL_TO_NAME[tx.market]}
                              </div>
                              <div className="text-sm font-semibold text-moon">
                                {tx.market}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-lavender font-semibold text-md">
                        {tx.eventType}
                      </TableCell>
                      <TableCell className="text-moon">
                        <AssetName
                          symbol={tx.token}
                          name={SYMBOL_TO_NAME[tx.token]}
                          src={SYMBOL_TO_ICON[tx.token]}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 items-center">
                          <span className="text-lavender font-medium">
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
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer font-normal text-primary underline hover:opacity-80"
                            href={`${appConfig.client.fuelExplorerUrl}/tx/${tx.transactionHash}`}
                          >
                            {`${tx.transactionHash.slice(0, 8)}...${tx.transactionHash.slice(-4)}`}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-lavender">{tx.date}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="w-full gap-x-2 text-md font-semibold text-moon flex justify-center items-center">
                        <button
                          type="button"
                          onClick={() => setPage(page > 1 ? page - 1 : 1)}
                        >
                          {'<'}
                        </button>
                        Page {page} of {totalPages}
                        <button
                          type="button"
                          onClick={() =>
                            setPage(page < totalPages ? page + 1 : totalPages)
                          }
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
                    <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                      No Transactions
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>

      <Table className="max-lg:hidden mt-12">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={8}>
              <div className="w-full flex items-center justify-center gap-x-2 text-white font-semibold">
                Liquidated Positions
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Market
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Event Type
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              TX ID
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPendingLqHistory ? (
            <TableRow>
              <TableCell>
                <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
              </TableCell>
            </TableRow>
          ) : (
            <>
              {liquidationHistory.length > 0 ? (
                <>
                  {liquidationHistory?.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-moon">
                        <div className="flex gap-x-2 items-center">
                          <div>
                            <Image
                              src={SYMBOL_TO_ICON[tx.market]}
                              alt={tx.market}
                              width={32}
                              height={32}
                              className={'rounded-full'}
                            />
                          </div>
                          <div>
                            <div className="flex gap-x-2 items-baseline">
                              <div className="text-white text-md font-semibold">
                                {SYMBOL_TO_NAME[tx.market]}
                              </div>
                              <div className="text-sm font-semibold text-moon">
                                {tx.market}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-red-500 font-semibold text-md">
                        Liquidation
                      </TableCell>
                      <TableCell className="text-moon">
                        <div>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer font-normal text-primary underline hover:opacity-80"
                            href={`${appConfig.client.fuelExplorerUrl}/tx/${tx.transactionHash}`}
                          >
                            {`${tx.transactionHash.slice(0, 8)}...${tx.transactionHash.slice(-4)}`}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-lavender">{tx.date}</TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                      No Liquidations
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
