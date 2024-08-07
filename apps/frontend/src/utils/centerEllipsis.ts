export default function centerEllipsis(str: string, symbols = 10) {
  if (str.length <= symbols) return str;
  return `${str.slice(0, symbols / 2)}...${str.slice(-symbols / 2)}`;
}
