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
  'YE', // YEMEN
  'ZW', // ZIMBABWE
];

export default function middleware(req: NextRequest) {
  const country = req.geo?.country;

  if (
    req.nextUrl.pathname !== '/blocked' &&
    process.env.NODE_ENV !== 'development' &&
    (!country || BLOCKED_COUNTRIES.includes(country))
  ) {
    return NextResponse.redirect(new URL('/blocked', req.url));
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
    // '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',

    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
