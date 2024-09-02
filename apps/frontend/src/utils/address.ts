import { Address } from 'fuels';

export default function getAddressB256(address: string | null) {
  if (address == null) return '';
  return Address.fromString(address).toB256();
}
