# swaylend-scripts-ts

TypeScript port of the Rust admin scripts at `../scripts/`. Owner-only actions
are wired to **Bako Safe** multisig wallets (predicate-based smart-contract
wallets on Fuel) so the protocol can be administered via M-of-N signing
instead of a single private key. Permissionless scripts use a regular Fuel
wallet.

## Why this exists

The original Rust scripts in `../scripts/` use the Rust `fuels` SDK, which
doesn't support Bako (Bako only ships a TypeScript SDK). To transfer protocol
ownership to a Bako multisig, every owner-gated admin operation needs a
TS-native equivalent.

## Setup

```bash
pnpm install --ignore-workspace          # local install (skips parent workspace)
pnpm typegen                             # regenerate src/sway-api/ from abis/
pnpm build                               # type-check (no emit)
cp .env.example .env                     # then fill in
```

## Environment

All env vars are documented inline in `.env.example`. Minimum required per
script type:

| Script type | Required env vars |
|---|---|
| Permissionless (`deploy-*`, `mint-tokens`, `fill-reserves`) | `NETWORK`, `PROVIDER_URL`, `SIGNING_KEY` (+ contract ids relevant to the script) |
| Owner (Bako-signed) | `NETWORK`, `PROVIDER_URL`, `PROXY_CONTRACT_ID`, `BAKO_WALLET_ADDRESS`, `BAKO_TOKEN_API` |

## Creating a testnet Bako vault

We can't deploy a Bako vault from code (the predicate-version + signer set
determines the address). One-time UI flow:

1. Open https://safe.bako.global, connect a Fuel wallet (Fuel, Fuelet, Bako
   browser extension).
2. Switch network to **testnet**.
3. **New vault** → set signer threshold (e.g. 1-of-1 for solo testing, 2-of-3
   for a real multisig) → add signer addresses → deploy.
4. Copy the resulting vault address (b256). Paste into `.env` as
   `BAKO_WALLET_ADDRESS`.
5. Same panel → **API Keys** → create a CLI token. Paste as `BAKO_TOKEN_API`.

Repeat on mainnet when ready for production.

The current testnet test vault: `0x5Ae1d20f72ebbc559571788195E326De3Ea41419499420B366Fc5a30948e68B9`

## Script map

| Rust binary | TS script | Owner-only? | Wallet |
|---|---|---|---|
| `activate_market` | `pnpm activate-market <cfg>` | yes | Bako |
| `update_market` | `pnpm update-market <cfg>` | yes | Bako |
| `update_collateral_assets` | `pnpm update-collateral-assets <cfg>` | yes | Bako |
| `change_proxy_owner` | `pnpm change-proxy-owner <addr-or-contract>` | yes | Bako |
| `change_market_owner` | `pnpm change-market-owner <addr-or-contract>` | yes | Bako |
| `withdraw_reserves` | `pnpm withdraw-reserves <amt> [recipient]` | yes | Bako |
| `fill_reserves` | `pnpm fill-reserves <amt>` | no | EOA |
| `deploy_tokens` | `pnpm deploy-tokens` | no | EOA |
| `deploy_pyth` | `pnpm deploy-pyth` | no | EOA |
| `mint_tokens` | `pnpm mint-tokens <cfg>` | no | EOA |

## Identity argument format

For scripts that take a target identity (owner transfers, withdraw recipient,
mint recipient):

```
address:0x<32-byte b256 of an EOA or Bako vault>
contract:0x<32-byte b256 of a contract id>
```

## Signing flow (owner scripts)

1. Script connects to Bako via `BakoProvider.create(url, { apiToken })`.
2. Script loads the vault via `Vault.fromAddress(address, provider)`.
3. Each contract call (`.functions.x(...).call()`) queues a pending tx on
   Bako's backend.
4. **Open https://safe.bako.global in a browser**; the pending tx will be
   visible to all configured signers with decoded calldata.
5. Each signer approves. Once M-of-N is met, Bako submits to Fuel.
6. The script blocks on `waitForResult()`, prints the tx id, then continues
   (or terminates on success).

While waiting, the script prints `⏳ Waiting for Bako signatures...` every 5s.
Cancel with Ctrl-C — pending Bako txs can be rejected from the UI.

## Notes on version pinning

- `fuels@0.101.3` — matches the rest of the swaylend monorepo, so the same
  `Provider`/`Wallet` semantics apply.
- `bakosafe@0.5.4` — last release on the `fuels@^0.101.0` peer dep. Newer
  Bako (0.6.x) requires `fuels@^0.102.0` which would force a wider bump.
  See `../../scripts-ts-NOTES.md` (or chat history) for the trade-off
  analysis if/when you want to bump.

## Configuration files

Lives in `../scripts/configs/`:

- `mainnet_usdc_config.json` — live mainnet
- `testnet_usdc_config.json`, `testnet_usdt_config.json` — public testnet
- `*_mock_config.json` — devnet/testnet against mock contracts
- `devnet_*` — local devnet

You can pass any of these to the scripts that take `<config.json>`.

## Smoke-test order on testnet

A safe rehearsal sequence before doing the real ownership transfer:

1. `pnpm deploy-pyth` — note the contract id. Add to `.env` as `PYTH_CONTRACT_ID`.
2. `pnpm deploy-tokens` — note the contract id. Add as `TOKEN_CONTRACT_ID`.
3. Update the mock config JSON's `pyth_contract_id` and collateral `asset_id`s
   (must match `getMintedAssetId(token, sha256(symbol))`).
4. `pnpm mint-tokens scripts/configs/testnet_usdc_mock_config.json --amount 1000000000`
   — confirms the sub_id derivation lines up with the config.
5. (Manual) Deploy market + proxy contracts via `forc deploy` or the team's
   existing deploy flow. Set `PROXY_CONTRACT_ID` / `TARGET_CONTRACT_ID`.
6. `pnpm activate-market scripts/configs/testnet_usdc_mock_config.json` — uses
   the Bako vault as initial owner.
7. `pnpm change-proxy-owner address:<your_bako_vault_b256>` — transfer proxy
   ownership to the same vault if not already.
8. Now you can rehearse: `pnpm update-market`, `pnpm withdraw-reserves`, etc.

## Future cleanups

- Bump to `bakosafe@0.6.5` + `fuels@0.102+` once we're ready to upgrade.
- Add per-script `--dry-run` flag that prints the encoded calldata without
  submitting.
- Add a `fuels.config.ts` so `pnpm fuels build` would regenerate types from
  source ABIs in `../contracts/*/out/release/*` directly.
