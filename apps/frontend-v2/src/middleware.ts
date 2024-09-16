import { NextResponse, type NextRequest } from 'next/server';

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

  if (
    process.env.NODE_ENV !== 'development' &&
    (!country || BLOCKED_COUNTRIES.includes(country))
  ) {
    return new Response('Blocked for legal reasons', { status: 451 });
  }

  return NextResponse.next();
}
