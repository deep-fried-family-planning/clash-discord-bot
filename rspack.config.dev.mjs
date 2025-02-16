import {defineConfig} from '@rspack/cli';
import config from './rspack.config.mjs';
import {rspack} from '@rspack/core';


export default defineConfig({
  ...config,

  mode : 'development',
  // devtool: 'eval-source-map',
  cache: true,

  optimization: {
    ...config.optimization,
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin({
      minimizerOptions: {
        module: true,
        mangle: {
          keep_fnames: true,
        },
      },
    })],
  },
});
