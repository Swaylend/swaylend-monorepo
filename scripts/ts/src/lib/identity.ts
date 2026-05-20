import type { IdentityInput } from '../sway-api/Market';

/**
 * Parse a CLI-style identity spec into a Fuel `Identity` for owner transfers.
 *
 * Format:
 *   address:0x...    → Identity::Address(...)
 *   contract:0x...   → Identity::ContractId(...)
 */
export function parseIdentity(spec: string): IdentityInput {
  const [kind, value] = spec.split(':', 2);
  if (!kind || !value || !value.startsWith('0x')) {
    throw new Error(`Invalid identity spec "${spec}". Expected address:0x... or contract:0x...`);
  }
  if (kind === 'address') {
    return { Address: { bits: value } };
  }
  if (kind === 'contract') {
    return { ContractId: { bits: value } };
  }
  throw new Error(`Unknown identity kind "${kind}". Use "address" or "contract".`);
}

export function formatIdentity(identity: IdentityInput): string {
  if (identity.Address) {
    return `Address(${identity.Address.bits})`;
  }
  if (identity.ContractId) {
    return `ContractId(${identity.ContractId.bits})`;
  }
  return JSON.stringify(identity);
}
