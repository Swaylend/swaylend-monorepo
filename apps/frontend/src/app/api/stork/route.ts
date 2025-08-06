import { NextResponse } from 'next/server';

// Cache for 20s
export const revalidate = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceFeedIds = searchParams.get('priceFeedIds');

  const response = await fetch(
    `https://rest.jp.stork-oracle.network/v1/prices/latest?assets=${priceFeedIds}`,
    {
      method: 'GET',
      headers: {
        Authorization: process.env.STORK_API_KEY!,
        Accept: '*/*',
      },
    }
  );

  const rawJson = await response.text();

  return NextResponse.json({
    rawJson,
  });
}
