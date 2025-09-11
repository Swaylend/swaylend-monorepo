import hash from 'stable-hash';

/**
 * Creates a stable hash from an object using the stable-hash library.
 * This ensures that objects with the same content (regardless of key order)
 * produce the same hash.
 */
export function createStableHash(obj: unknown): string | null {
  if (obj == null) return null;
  return Buffer.from(hash(obj)).toString('hex');
}
