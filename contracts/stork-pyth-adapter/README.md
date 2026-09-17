# stork-pyth-adapter

Lets the market read prices from [Stork](https://docs.stork.network) without
touching the audited market contract.

## Why

Pyth retired the permissionless Hermes endpoint in the Core upgrade
(26 Aug 2026); `hermes.pyth.network` now answers `401` without an API key, and
plans start at $500/month. More importantly, **the FUEL and ezETH feeds no
longer exist in Pyth's catalogue at any price tier**, so the mainnet USDC market
cannot be priced from Pyth regardless of subscription.

Stork carries FUEL, ETH, USDC, USDT, weETH and wstETH - plus ezETH and sDAI,
added at our request - and already has a contract deployed on Fuel mainnet.

## How

The market's only coupling to its oracle is the `PythCore` ABI plus an
owner-settable `pyth_contract_id`. This contract implements that same ABI and
sources data from Stork, so the switch is a single owner call:

```
market.set_pyth_contract_id(<adapter>)
```

The market keeps its storage, its proxy and every user position. Pointing
`pyth_contract_id` back at Pyth rolls it back just as cheaply.

```
market ──PythCore──▶ stork-pyth-adapter ──Stork ABI──▶ Stork (0x9c118ae1…)
```

## Conversions

| Concern | Stork | Pyth / market | Adapter |
|---|---|---|---|
| Value | `I128`, 18 decimals | `u64` + positive `exponent` | rescales per feed; 18-dec ETH overflows `u64`, so each feed declares the exponent Pyth used to return (usually 8) |
| Timestamp | unix nanoseconds | TAI64 | `ns / 1e9 + 2^62`, matching pyth-interface's `TAI64_DIFFERENCE` |
| Confidence | none | `price ± confidence` | synthesised as `price * conf_bps / 10_000` |
| Feed id | keccak of asset name | Pyth feed id | `feeds` map, owner-settable, so collateral configs stay untouched |

### On confidence

The market values collateral at `price - confidence` and liquidates at
`price + confidence`. Reporting `confidence = 0` would quietly remove a safety
margin the protocol has today, so each feed carries a `conf_bps` instead. The
adapter caps it at 300 bps to match the market's own `ORACLE_MAX_CONF_WIDTH`;
anything above that is rejected by `get_price_internal` anyway.

## Update wire format

`update_price_feeds_if_necessary` takes `Vec<Bytes>`. The market passes it
through opaquely, so the encoding is ours. Each element is exactly 185 bytes,
big-endian:

| Offset | Bytes | Field |
|---|---|---|
| 0 | 32 | `id` (Stork asset id) |
| 32 | 8 | `timestamp_ns` |
| 40 | 16 | `quantized_value`, raw `I128` underlying (value + 2^127) |
| 56 | 32 | `publisher_merkle_root` |
| 88 | 32 | `value_compute_alg_hash` |
| 120 | 32 | `r` |
| 152 | 32 | `s` |
| 184 | 1 | `v` |

Stork verifies the signature itself and ignores updates that are not fresher
than stored state, which is what makes the "if necessary" semantics work.

## Building

Stork's Sway SDK targets std 0.69.x while the rest of this repo is pinned to
forc 0.66.4, so this contract is **not** a workspace member and carries its own
`fuel-toolchain.toml`. Build it from this directory:

```bash
cd contracts/stork-pyth-adapter
forc build
```

## Deploying

1. Deploy, then `initialize(owner = <Bako vault>, stork_contract_id = <Stork>)`.
2. `set_feed(...)` once per asset, mapping each Pyth feed id in the market
   config to its Stork asset id.
3. `market.set_pyth_contract_id(<adapter>)` through the multisig.

Stork contract ids: mainnet `0x9c118ae13927dd51ba59c0370dc8c272a3b64ccd675950750c8840a649c81149`,
testnet `0x09c88f50d535ac5ce8945e34c418233b1e3834be9a88effb57cb137321fbae0c`.

## Coverage

All eight market assets are covered. Stork added `EZETHUSD` and `SDAIUSD` on
2026-09-18 at our request: ezETH is USD spot, sDAI is derived from its
redemption rate because its spot has a single low-volume source.
