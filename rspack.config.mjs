import {defineConfig} from '@rspack/cli';
import {resolve} from 'node:path';
import {rspack} from '@rspack/core';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';

const RsDoctor = new RsdoctorRspackPlugin({
  mode    : 'normal',
  supports: {
    parseBundle      : true,
    banner           : false,
    generateTileGraph: true,
  },
  features: {
    resolver   : true,
    loader     : true,
    plugins    : true,
    bundle     : true,
    treeShaking: true,
  },
  disableTOSUpload: true,
});


const targets = ['node >= 22.11'];


export default defineConfig({
  mode  : 'production',
  target: ['node22.11', 'es2022'],

  experiments: {
    outputModule         : true,
    topLevelAwait        : true,
    futureDefaults       : true,
    cache                : true,
    layers               : true,
    parallelCodeSplitting: true,
    rspackFuture         : {bundlerInfo: {force: false}},
  },

  entry: {
    'dev_ws/index': {import: 'dev/dev_ws.ts'},

    'ddb_stream/index'   : {import: 'src/ddb_stream.ts'},
    'ix_api/index'       : {import: 'src/ix_api.ts'},
    'ix_menu/index'      : {import: 'src/ix_menu.ts'},
    'ix_menu_close/index': {import: 'src/ix_menu_close.ts'},
    'ix_slash/index'     : {import: 'src/ix_slash.ts'},
    'poll/index'         : {import: 'src/poll.ts'},
    'task/index'         : {import: 'src/task.ts'},
    'test/index'         : {import: 'src/jsx.ts'},
  },

  output: {
    module                       : true,
    environment                  : {module: true, nodePrefixForCoreModules: true},
    library                      : {type: 'module'},
    strictModuleErrorHandling    : true,
    strictModuleExceptionHandling: true,
    compareBeforeEmit            : true,
    iife                         : false,
  },

  externalsType   : 'module',
  externalsPresets: {node: true},
  externals       : [/@aws-sdk./, /@discordjs./],

  resolve: {
    tsConfig  : resolve(import.meta.dirname, 'tsconfig.json'),
    extensions: ['...', '.ts', '.tsx'],
  },

  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          module: true,
          mangle: {
            // keep_fnames: true,
          },
        },
      }),
    ],
    splitChunks   : false,
    avoidEntryIife: true,
  },

  cache: true,

  profile: true,

  module: {
    rules: [{
      test   : /\.js$/,
      exclude: /node_modules/,
      use    : [{
        loader : 'builtin:swc-loader',
        options: {
          target: 'es2022',
          jsc   : {parser: {syntax: 'ecmascript'}},
        },
      }],
    },
      {
        test   : /\.ts$/,
        exclude: /node_modules/,
        use    : [{
          loader : 'builtin:swc-loader',
          options: {
            target: 'es2022',
            jsc   : {parser: {syntax: 'typescript'}},
          },
        }],
      },

      {
        test   : /\.tsx$/,
        exclude: /node_modules/,
        use    : [{
          loader : 'builtin:swc-loader',
          options: {
            jsc: {
              target   : 'es2022',
              parser   : {syntax: 'typescript', tsx: true},
              transform: {react: {runtime: 'automatic', importSource: 'src/disreact/dsx'}},
            },
          },
        }],
      },


      // {
      //   test   : /\.tsx$/,
      //   exclude: /node_modules/,
      //   use    : [{
      //     loader : 'esbuild-loader',
      //     options: {loader: 'jsx', target: 'esnext'},
      //   }],
      // },
    ],
  },

  // plugins: [RsDoctor],

  devtool: 'eval-source-map',

  performance: {hints: 'warning'},
  stats      : {preset: 'errors-only', entrypoints: true, performance: true, children: true},
});
