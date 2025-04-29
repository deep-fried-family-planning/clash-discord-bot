import {defineConfig} from '@rspack/cli';
import {resolve} from 'node:path';
import tsconfig from './tsconfig.json' with {type: 'json'};

export default defineConfig({
  mode  : 'production',
  target: 'node22.15',

  experiments: {
    outputModule  : true,
    topLevelAwait : true,
    cache         : true,
    layers        : true,
    futureDefaults: true,
  },

  entry: {
    'dev_ws/index'  : {import: 'dev/dev_ws.ts'},
    'ix_api/index'  : {import: 'src/lambdas/ix_api.ts'},
    'ix_menu/index' : {import: 'src/lambdas/ix_components.ts'},
    'ix_slash/index': {import: 'src/lambdas/ix_commands.ts'},
    'poll/index'    : {import: 'src/lambdas/poll.ts'},
    'task/index'    : {import: 'src/lambdas/task.ts'},
  },

  output: {
    module                       : true,
    environment                  : {module: true},
    library                      : {type: 'module'},
    strictModuleErrorHandling    : true,
    strictModuleExceptionHandling: true,
    iife                         : false,
    asyncChunks                  : false,
    clean                        : true,
  },

  externalsType   : 'module',
  externalsPresets: {node: true},
  externals       : [/@aws-sdk./, /@discordjs./],

  resolve: {
    tsConfig  : resolve(import.meta.dirname, 'tsconfig.json'),
    extensions: ['...', '.ts', '.tsx'],
  },

  optimization: {
    splitChunks   : false,
    avoidEntryIife: true,
  },

  module: {
    rules: [{
      test   : /\.js$/,
      exclude: /node_modules/,
      loader : 'builtin:swc-loader',
      options: {
        jsc: {parser: {syntax: 'ecmascript'}},
      },
    }, {
      test   : /\.ts$/,
      exclude: /node_modules/,
      loader : 'builtin:swc-loader',
      options: {
        jsc: {parser: {syntax: 'typescript'}},
      },
    }, {
      test   : /\.tsx$/,
      exclude: /node_modules/,
      loader : 'builtin:swc-loader',
      options: {
        jsc: {
          parser   : {syntax: 'typescript', tsx: true},
          transform: {
            react: {
              runtime     : 'automatic',
              importSource: tsconfig.compilerOptions.jsxImportSource,
            },
          },
        },
      },
    }],
  },

  devtool: 'nosources-cheap-source-map',

  stats: {
    preset     : 'errors-only',
    entrypoints: true,
    performance: true,
    children   : true,
  },
  performance: {hints: 'warning'},
});
