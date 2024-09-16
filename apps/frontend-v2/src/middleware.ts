import { type NextRequest, NextResponse } from 'next/server';

const BLOCKED_COUNTRIES = [
  'BY', // BELARUS
  'BI', // BURUNDI
  'CF', // THE CENTRAL AFRICAN REPUBLIC
  'CD', // THE DEMOCRATIC REPUBLIC OF CONGO
  'KP', // THE DEMOCRATIC PEOPLE'S REPUBLIC OF KOREA
  'UA', // THE TEMPORARILY OCCUPIED REGIONS OF UKRAINE
  'CU', // CUBA
  'IR', // IRAN
  'IQ', // IRAQ
  'LY', // LIBYA
  'CN', // THE PEOPLE'S REPUBLIC OF CHINA
  'RU', // THE RUSSIAN FEDERATION
  'SO', // SOMALIA
  'SD', // SUDAN
  'SS', // SOUTH SUDAN
  'SY', // SYRIA
  'VE', // VENEZUELA
  'US', // THE UNITED STATES OF AMERICA
  'YE', // YEMEN
  'ZW', // ZIMBABWE
];

export function middleware(req: NextRequest) {
  const country = req.geo?.country;

  if (!country) {
    return NextResponse.next();
  }

  // TODO: Maybe better to move this to Cloudflare WAF
  // As Vercel cost will be too high for this
  if (BLOCKED_COUNTRIES.includes(country)) {
    return new Response('Blocked for legal reasons', { status: 451 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
