import { Mnemonic } from 'fuels';

export function isValidMnemonic(phrase: string): boolean {
  const words = phrase.split(' ');
  const mnemonic = new Mnemonic();
  return (
    words.filter((w) => mnemonic.wordlist.includes(w)).length === Number(12)
  );
}
