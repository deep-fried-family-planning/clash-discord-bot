import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import {defineConfig} from '@rspack/cli';
import config from './rspack.config.dev.mjs';

export default defineConfig({
  ...config,

  devtool: 'eval-source-map',
  cache  : true,
  profile: true,

  plugins: [
    ...config.plugins ?? [],

    new RsdoctorRspackPlugin({
      mode            : 'normal',
      disableTOSUpload: true,
      supports        : {
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
    }),
  ],
});
