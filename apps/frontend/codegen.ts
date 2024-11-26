import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  generates: {
    './src/__generated__/swaylend/': {
      documents: './src/lib/graphql/*.graphql',
      config: {
        documentMode: 'string',
      },
      schema: 'https://indexer.hyperindex.xyz/bfc2f60/v1/graphql',
      preset: 'client',
      plugins: [],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
