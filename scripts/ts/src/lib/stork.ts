/**
 * Stork REST client and on-chain update encoder.
 *
 * Stork replaces Pyth as the market's price source (see
 * contracts/stork-pyth-adapter). The market still speaks the Pyth ABI, so
 * callers hand the adapter an opaque `Vec<Bytes>`; this module builds those
 * bytes from Stork's signed REST payloads.
 *
 * Requires env vars:
 *   - STORK_API_URL   e.g. https://rest.jp.stork-oracle.network
 *   - STORK_API_KEY   the Basic auth token (base64 of "user:secret")
 */

/** Raw shape of one asset in `GET /v1/prices/latest`. */
export type StorkSignedPrice = {
  encoded_asset_id: string;
  price: string;
  publisher_merkle_root: string;
  calculation_alg: { checksum: string };
  timestamped_signature: {
    timestamp: number | string;
    signature: { r: string; s: string; v: string };
  };
};

export type StorkPrice = {
  asset: string;
  /** 18-decimal quantized value, as Stork publishes it. */
  quantizedValue: bigint;
  /** Unix nanoseconds. */
  timestampNs: bigint;
  signed: StorkSignedPrice;
};

/** Byte length of one encoded update; must match ENCODED_UPDATE_LEN in the adapter. */
export const ENCODED_UPDATE_LEN = 185;

/** I128 stores `value + 2^127`, so that is the offset the adapter subtracts back off. */
const I128_INDENT = 1n << 127n;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/**
 * Stork's nanosecond timestamps are larger than Number.MAX_SAFE_INTEGER, and
 * `JSON.parse` silently rounds them to the nearest float64. That rounding
 * breaks the on-chain signature check, because the timestamp is part of the
 * signed message - so quote the long integers before parsing and keep them as
 * strings.
 */
function parsePreservingPrecision(text: string): unknown {
  return JSON.parse(
    text.replace(/"timestamp":\s*(\d{16,})/g, '"timestamp":"$1"')
  );
}

/**
 * Fetches the latest signed prices for the given Stork asset names.
 *
 * Stork 404s the whole request if any asset is unknown, so callers should pass
 * only assets they know are in the catalogue.
 */
export async function fetchStorkPrices(
  assets: string[]
): Promise<Map<string, StorkPrice>> {
  const url = `${env('STORK_API_URL').replace(/\/$/, '')}/v1/prices/latest?assets=${assets.join(',')}`;
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${env('STORK_API_KEY')}` },
  });

  if (!res.ok) {
    throw new Error(
      `Stork ${res.status} for [${assets.join(', ')}]: ${await res.text()}`
    );
  }

  const body = parsePreservingPrecision(await res.text()) as {
    data: Record<string, { stork_signed_price: StorkSignedPrice }>;
  };
  const out = new Map<string, StorkPrice>();

  for (const [asset, entry] of Object.entries(body.data)) {
    const signed = entry.stork_signed_price;
    out.set(asset, {
      asset,
      quantizedValue: BigInt(signed.price),
      timestampNs: BigInt(signed.timestamped_signature.timestamp),
      signed,
    });
  }

  const missing = assets.filter((a) => !out.has(a));
  if (missing.length > 0) {
    throw new Error(`Stork returned no price for: ${missing.join(', ')}`);
  }

  return out;
}

function hexToBytes(hex: string, expectedLen: number): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length !== expectedLen * 2) {
    throw new Error(
      `Expected ${expectedLen}-byte hex, got ${clean.length / 2} bytes: ${hex}`
    );
  }
  const out = new Uint8Array(expectedLen);
  for (let i = 0; i < expectedLen; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bigintToBytes(value: bigint, len: number): Uint8Array {
  if (value < 0n) throw new Error(`Cannot encode negative value ${value}`);
  const out = new Uint8Array(len);
  let v = value;
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  if (v !== 0n) throw new Error(`Value ${value} does not fit in ${len} bytes`);
  return out;
}

/**
 * Packs one signed price into the adapter's wire format.
 *
 * Layout (big-endian), mirroring `decode_updates` in the adapter:
 *   [0..32)    id
 *   [32..40)   timestamp_ns
 *   [40..56)   quantized_value as the raw I128 underlying (value + 2^127)
 *   [56..88)   publisher_merkle_root
 *   [88..120)  value_compute_alg_hash
 *   [120..152) r
 *   [152..184) s
 *   [184]      v
 */
export function encodeStorkUpdate(price: StorkPrice): Uint8Array {
  const { signed } = price;
  const sig = signed.timestamped_signature.signature;

  const out = new Uint8Array(ENCODED_UPDATE_LEN);
  out.set(hexToBytes(signed.encoded_asset_id, 32), 0);
  out.set(bigintToBytes(price.timestampNs, 8), 32);
  out.set(bigintToBytes(price.quantizedValue + I128_INDENT, 16), 40);
  out.set(hexToBytes(signed.publisher_merkle_root, 32), 56);
  out.set(hexToBytes(signed.calculation_alg.checksum, 32), 88);
  out.set(hexToBytes(sig.r, 32), 120);
  out.set(hexToBytes(sig.s, 32), 152);
  out[184] = Number.parseInt(
    sig.v.startsWith('0x') ? sig.v.slice(2) : sig.v,
    16
  );

  return out;
}

/** Converts Stork's 18-decimal value to the exponent a given feed reports. */
export function toPythPrice(quantizedValue: bigint, exponent: number): bigint {
  if (exponent > 18)
    throw new Error(`Exponent ${exponent} exceeds Stork's 18 decimals`);
  return quantizedValue / 10n ** BigInt(18 - exponent);
}

/** Human-readable price, for logging and sanity checks. */
export function toDecimal(quantizedValue: bigint): number {
  return Number(quantizedValue) / 1e18;
}
