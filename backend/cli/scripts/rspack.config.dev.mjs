import {defineConfig} from '@rspack/cli';
import {rspack} from '@rspack/core';
import config from 'backend/rspack.config.ts';

export default defineConfig({
  ...config,

  mode     : 'none',
  devtool  : 'nosources-source-map',
  externals: [/effect.*/],
  // cache  : true,

  optimization: {
    ...config.optimization,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        test            : [/.*/],
        // extractComments : true,
        minimizerOptions: {
          minify  : false,
          module  : true,
          compress: {
            dead_code: true,
          },
          mangle: {
            keep_fnames: true,
          },
          format: {
            beautify: true,
            // comments: false,
          },
        },
      }),
    ],
    minimize              : true,
    removeAvailableModules: true,
    mergeDuplicateChunks  : true,
    concatenateModules    : true,
    innerGraph            : true,
    usedExports           : true,
    providedExports       : true,
    sideEffects           : true,
  },
});
