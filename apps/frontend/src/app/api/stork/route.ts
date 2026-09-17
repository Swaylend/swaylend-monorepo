import { type NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for Stork's REST API.
 *
 * Stork authenticates with a Basic token. Putting it in a NEXT_PUBLIC_ variable
 * would bake it into the browser bundle for anyone to lift, so the browser
 * calls this route instead and the key stays server-side.
 *
 * Also keeps the CSP simple: the page only ever talks to its own origin.
 */

const DEFAULT_STORK_API_URL = 'https://rest.jp.stork-oracle.network';

/** Stork asset names are uppercase alphanumerics, e.g. ETHUSD, WSTETHUSD. */
const ASSET_PATTERN = /^[A-Z0-9_]{1,32}$/;
const MAX_ASSETS = 32;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.STORK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Stork is not configured' },
      { status: 503 }
    );
  }

  const requested = request.nextUrl.searchParams.get('assets');
  if (!requested) {
    return NextResponse.json(
      { error: 'Missing "assets" parameter' },
      { status: 400 }
    );
  }

  // Validate rather than forward blindly, so this cannot be used as an open
  // proxy onto Stork's API with our credentials attached.
  const assets = requested.split(',').map((a) => a.trim().toUpperCase());
  if (assets.length > MAX_ASSETS || !assets.every((a) => ASSET_PATTERN.test(a))) {
    return NextResponse.json(
      { error: 'Invalid "assets" parameter' },
      { status: 400 }
    );
  }

  const baseUrl = (process.env.STORK_API_URL ?? DEFAULT_STORK_API_URL).replace(
    /\/$/,
    ''
  );

  try {
    const upstream = await fetch(
      `${baseUrl}/v1/prices/latest?assets=${assets.join(',')}`,
      {
        headers: { Authorization: `Basic ${apiKey}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!upstream.ok) {
      // Surface the status but not the body: upstream errors can echo request
      // details we would rather not hand back to the browser.
      return NextResponse.json(
        { error: `Stork request failed (${upstream.status})` },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    // Pass the body through as raw text. Parsing and re-serialising here would
    // round Stork's nanosecond timestamps, which exceed Number.MAX_SAFE_INTEGER
    // and are part of the message the on-chain signature covers.
    return new NextResponse(await upstream.text(), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Stork unreachable' }, { status: 504 });
  }
}
