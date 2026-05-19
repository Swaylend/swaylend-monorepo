import type { Account } from 'fuels';
import { Market } from '../sway-api/Market';
import { Proxy } from '../sway-api/Proxy';
import { PythMock } from '../sway-api/PythMock';
import { Token } from '../sway-api/Token';
import { requireField } from './config';

/**
 * Returns a `Market` contract instance pointed at the **proxy** contract id.
 *
 * This mirrors the Rust scripts which always call `MarketContract::new(proxy_contract_id, wallet)` —
 * the proxy forwards calls to the underlying implementation but the ABI used to encode them
 * is the Market ABI.
 */
export function getMarket(account: Account): Market {
  const proxyId = requireField('proxyContractId');
  return new Market(proxyId, account);
}

export function getProxy(account: Account): Proxy {
  const proxyId = requireField('proxyContractId');
  return new Proxy(proxyId, account);
}

export function getPyth(account: Account): PythMock {
  const pythId = requireField('pythContractId');
  return new PythMock(pythId, account);
}

export function getToken(account: Account): Token {
  const tokenId = requireField('tokenContractId');
  return new Token(tokenId, account);
}
