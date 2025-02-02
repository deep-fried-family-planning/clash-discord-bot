import * as dsxconfig from 'src/disreact/dsx/config.ts';
import * as dfmd from './dfmd.ts';
import * as dattributes from 'src/disreact/dsx/dattributes.ts';
import * as dtml from './dtml.ts';

export {
  dsxconfig,
  dattributes,
  dfmd,
  dtml,
};

export const tags = {
  ...dfmd,
  ...dtml,
};
