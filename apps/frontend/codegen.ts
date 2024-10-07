import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  generates: {
    './src/__generated__/swaylend/': {
      documents: './src/lib/graphql/*.graphql',
      config: {
        documentMode: 'string',
      },
      schema: 'https://indexer.bigdevenergy.link/9ddd3ee/v1/graphql',
      preset: 'client',
      plugins: [],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
