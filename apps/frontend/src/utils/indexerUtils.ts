import { INDEXER_URL } from '@src/constants';
import axios from 'axios';

export type TCollateralConfiguration = {
  asset_id: string;
  borrow_collateral_factor: number;
  decimals: number;
  id: string;
  liquidate_collateral_factor: number;
  liquidation_penalty: number;
  paused: boolean;
  price_feed: string;
  supply_cap: number;
};
export async function fetchCollateralConfigurations(): Promise<
  Array<TCollateralConfiguration>
> {
  const query =
    'SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_swaylend_indexer.collateralconfigurationentity) t;';
  const url = INDEXER_URL;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  return axios
    .request({ method: 'POST', url, headers, data: { query } })
    .then((v) => v.data.data[0]);
}
