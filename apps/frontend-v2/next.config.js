module.exports = {
  webpack: {
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        issuer: {
          test: /\.(js|ts)x?$/,
          // for webpack 5 use
          // { and: [/\.(js|ts)x?$/] }
        },

        use: ['@svgr/webpack'],
      });
      config.resolve.fallback = {
        crypto: false,
        http: require.resolve('stream-http'),
        url: false,
        https: require.resolve('https-browserify'),
      };
      return config;
    },
  },
};
