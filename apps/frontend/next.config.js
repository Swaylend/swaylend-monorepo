// @ts-check

const CONNECT_DOMAINS = [
  // CDN
  'https://static.swaylend.com',
  'https://testnet-swaylend.b-cdn.net',
  // Swaylend API
  'https://testnet-api.swaylend.com',
  'https://api.swaylend.com',
  // Fuel
  'https://testnet.fuel.network',
  'https://mainnet.fuel.network',
  // Outside domains
  'https://api.web3modal.org',
  'wss://relay.walletconnect.com',
  'https://verify.walletconnect.com',
  'https://verify.walletconnect.org',
  'wss://relay.walletconnect.org',
  'https://api.bako.global',
  'wss://api.bako.global',
  // PostHog
  'https://eu.i.posthog.com',
  // Sentio
  'https://app.sentio.xyz',
  // Hermes
  'https://gateway-lon.liquify.com',
  'https://hermes.pyth.network',
  // OpenBlock
  'https://www.data-openblocklabs.com',
];

const CSP_HEADER = `
    default-src 'self';
    connect-src 'self' https://app.swaylend.com ${CONNECT_DOMAINS.join(' ')};
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://static.swaylend.com https://testnet-swaylend.b-cdn.net;
    style-src 'self' 'unsafe-inline' https://static.swaylend.com https://testnet-swaylend.b-cdn.net https://fonts.googleapis.com;
    img-src 'self' blob: data: https://static.swaylend.com https://testnet-swaylend.b-cdn.net;
    font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://static.swaylend.com https://testnet-swaylend.b-cdn.net;
    object-src 'none';
    base-uri 'self';
    frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://mira.ly/;
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
module.exports = (phase, { defaultConfig }) => {
  let assetPrefix = undefined;

  if (process.env.USE_CDN === 'mainnet') {
    assetPrefix = 'https://static.swaylend.com';
  } else if (process.env.USE_CDN === 'testnet') {
    assetPrefix = 'https://testnet-swaylend.b-cdn.net';
  }

  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    assetPrefix: assetPrefix,
    /* config options here */
    webpack: (config, _) => {
      // SVGR Config from: https://react-svgr.com/docs/next/
      // Grab the existing rule that handles SVG imports
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg')
      );

      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
          use: ['@svgr/webpack'],
        }
      );

      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i;

      config.resolve.fallback = {
        crypto: false,
        http: false,
        url: false,
        https: false,
      };

      return config;
    },
    async headers() {
      return [
        {
          // Apply security headers to all routes
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'Content-Security-Policy',
              value: CSP_HEADER.replace(/\n/g, ''),
            },
          ],
        },
      ];
    },
  };

  return nextConfig;
};
