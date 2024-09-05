import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMarketConfiguration } from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import { ASSET_ID_TO_SYMBOL, formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import React from 'react';

export const LendTable = () => {
  const { account } = useAccount();
  const {
    mode,
    actionTokenAssetId,
    tokenAmount,
    action,
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
  } = useMarketStore();

  const { data: marketConfiguration } = useMarketConfiguration();

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeActionTokenAssetId(marketConfiguration?.baseToken);
  };

  const { balance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-3/12">Lend Asset</TableHead>
          <TableHead className="w-1/6">Lend APY</TableHead>
          <TableHead className="w-1/6">Supplied Assets</TableHead>
          <TableHead className="w-1/6">Supply Points</TableHead>
          <TableHead className="w-3/12">{}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
          <TableCell>5%</TableCell>
          <TableCell>10</TableCell>
          <TableCell>100</TableCell>
          <TableCell>
            <div className="flex gap-x-2 w-full">
              <Button
                className="w-1/2"
                onClick={() => {
                  handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                }}
              >
                Supply
              </Button>
              <Button
                className="w-1/2"
                onClick={() => {
                  handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
                }}
              >
                Withdraw
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
