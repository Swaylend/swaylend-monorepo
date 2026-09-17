# Mainnet migration runbook: Pyth -> Stork

Sequence for moving the mainnet USDC market onto Stork. Steps 1-3 change
nothing about the market and are safe to run at any time; step 4 is the live
cutover and needs a Bako signature.

## Facts this was written against

| | |
|---|---|
| Live market (proxy) | `0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae` |
| Market owner (Bako vault) | `0xa7dae7c2729b910e99386464e6a157d7a2b636fb7cdb41b815a97a46b9233d78` |
| Current oracle (Pyth) | `0x1c86fdd9e0e7bc0d2ae1bf6817ef4834ffa7247655701ee1b031b52a24c523da` |
| Stork contract (mainnet) | `0x9c118ae13927dd51ba59c0370dc8c272a3b64ccd675950750c8840a649c81149` |
| **Adapter (mainnet, deployed 2026-09-18)** | `0xb30c931a724a2e5bfa98e0a4b463887ac1751b60e5b5a1ae52c0d529456c67a4` |
| Market version | 5 |

Note the live market is **not** either of the USDC market ids in
`DEPLOYMENTS.md` - those contracts hold no balances. Confirm with
`contractBalances` before trusting any address here.

The mainnet Stork contract verifies against public key
`0x0bb53e0d…d053`, which is the same key the REST payloads are signed with,
and charges 1 wei per update.

## 0. Prerequisites

- Deployer wallet funded with mainnet ETH. Three full testnet rehearsals
  (deploy + 8 `set_feed` + `transfer_ownership` + verification update) cost
  **0.0000049 ETH total**, so 0.005 ETH is an enormous margin. Gas pricing on
  mainnet may differ from testnet, but not by three orders of magnitude.
- `STORK_API_KEY` / `STORK_API_URL` for the `swaylend` Stork account.
- A `.env` in `scripts/ts` pointing at mainnet:

```
NETWORK=mainnet
PROVIDER_URL=https://mainnet.fuel.network/v1/graphql
PROXY_CONTRACT_ID=0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae
BAKO_WALLET_ADDRESS=0xa7dae7c2729b910e99386464e6a157d7a2b636fb7cdb41b815a97a46b9233d78
BAKO_TOKEN_API=<mainnet vault api token>
SIGNING_KEY=<deployer key>
STORK_API_URL=https://rest.jp.stork-oracle.network
STORK_API_KEY=<basic token>
```

`BAKO_WALLET_ADDRESS` must be the market's current owner, so the adapter ends
up under the same multisig that controls the market.

> **Status:** steps 1-3 are done. The adapter is deployed, owned by the vault,
> and verified against mainnet Stork (all eight feeds PASS). The market is
> still reading from Pyth. Only step 4 remains, and it needs a Bako signature.

## 1. Deploy and configure the adapter

```bash
cd scripts/ts
pnpm deploy-stork-adapter configs/stork-feeds.mainnet.json
```

Deploys, initialises with the deployer as owner, writes all eight feed
mappings, reads them back, then transfers ownership to the Bako vault.
Ownership moves last so the whole table lands in one run rather than eight
rounds of multisig signatures.

**The market is untouched at this point** - it is still reading from Pyth. The
adapter is just an unreferenced contract on chain.

## 2. Verify the adapter serves correct prices

```bash
ADAPTER_ID=<address from step 1> \
  pnpm verify-stork-adapter configs/stork-feeds.mainnet.json
```

Writes a real Stork update through the adapter, then reads every feed back
over the Pyth ABI and asserts the exact quantized value, exponent, synthetic
confidence and freshness the market will see. **Do not proceed unless all eight
report PASS.**

## 3. Stage the config change

Set `pyth_contract_id` in `scripts/configs/mainnet_usdc_config.json` to the
adapter address. Leave everything else alone - `update-market` diffs each
section separately and will only prompt for the oracle change.

## 4. Cut over (live)

```bash
pnpm update-market ../configs/mainnet_usdc_config.json
```

Answer `n` to the market-configuration and pause sections, `y` to the Pyth
contract id section. That queues a `set_pyth_contract_id` transaction for
signing at https://safe.bako.global; the script blocks until the required
signatures land.

From the moment it mines, every price the market reads comes from Stork.

### Rolling back

Set `pyth_contract_id` back to `0x1c86fdd9…` and run `update-market` again.
Same one call, same signature requirement. The market's storage, its proxy and
every user position are untouched by either direction, so rollback costs
nothing but a signature.

## 5. Off-chain consumers

Only after step 4 mines, since they expect the market's oracle to be the
adapter:

- **liqy**: set `ORACLE=stork`, `STORK_API_URL`, `STORK_API_KEY`, and point
  `DEPLOYED_MARKETS.USDC_MAINNET.oracleAddress` at the adapter. Restart under
  pm2.
- **frontend**: deploy the branch. `STORK_API_KEY` and `STORK_API_URL` are
  already set on the Vercel project.
- **swaylend-points**: set `STORK_API_KEY`; it reads history, so it is
  independent of the on-chain switch and can be deployed at any time.

## Verifying afterwards

```bash
ADAPTER_ID=<adapter> pnpm verify-stork-adapter configs/stork-feeds.mainnet.json
```

and confirm the market now reports the adapter:

```
market.get_pyth_contract_id() == <adapter address>
```
