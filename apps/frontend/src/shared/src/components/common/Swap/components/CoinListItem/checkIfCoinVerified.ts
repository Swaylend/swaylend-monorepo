interface Network {
  type: string;
  chain: string;
  decimals: number;
  chainId: number;
  address?: string;
  assetId?: string;
  contractId?: string;
  subId?: string;
}

interface Asset {
  name: string;
  symbol: string;
  icon: string;
  networks: Network[];
}

export type VerifiedAssets = Asset[];

export const checkIfCoinVerified = ({
  symbol,
  assetId,
  verifiedAssetData,
}: {
  symbol?: string;
  assetId: string;
  verifiedAssetData: VerifiedAssets;
}) => {
  const coin = verifiedAssetData?.find((i: any) => i.symbol === symbol);
  const verifiedAsset = coin?.networks?.find((i: any) => i.assetId === assetId);
  return !!verifiedAsset;
};
