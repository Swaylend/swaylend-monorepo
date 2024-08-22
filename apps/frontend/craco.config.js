const path = require('node:path');

module.exports = {
  webpack: {
    configure: (config) => {
      // ...
      const fileLoaderRule = getFileLoaderRule(config.module.rules);
      if (!fileLoaderRule) {
        throw new Error('File loader not found');
      }
      fileLoaderRule.exclude.push(/\.cjs$/);

      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };
      config.resolve.alias = {
        '@src': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@screens': path.resolve(__dirname, './src/screens'),
      };
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

function getFileLoaderRule(rules) {
  for (const rule of rules) {
    if ('oneOf' in rule) {
      const found = getFileLoaderRule(rule.oneOf);
      if (found) {
        return found;
      }
    } else if (rule.test === undefined && rule.type === 'asset/resource') {
      return rule;
    }
  }
}
