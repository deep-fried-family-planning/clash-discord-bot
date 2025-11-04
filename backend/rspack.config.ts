import {defineConfig} from '@rspack/cli';
import {EnvironmentPlugin, SwcJsMinimizerRspackPlugin} from '@rspack/core';
import {resolve} from 'node:path';
import tsconfig from '../tsconfig.old.json' with {type: 'json'};

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

  // plugins: [
  //   new EnvironmentPlugin({}),
  // ],

  entry: {
    'dev_ws/index'  : {import: './dev/dev_ws.ts'},
    'ix_api/index'  : {import: './src/lambdas/runtime/ix_api.runtime.ts'},
    'ix_menu/index' : {import: './src/lambdas/runtime/ix_components.runtime.ts'},
    'ix_slash/index': {import: './src/lambdas/runtime/ix_commands.runtime.ts'},
    'poll/index'    : {import: './src/lambdas/runtime/poll.runtime.ts'},
    'task/index'    : {import: './src/lambdas/runtime/task.runtime.ts'},
  },

  output: {
    path                         : resolve(process.cwd(), '.dist'),
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
    minimizer     : [
      new SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          minify: true,
          mangle: {
            keep_fnames: true,
          },
          module  : true,
          compress: true,
        },
      }),
    ],
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
