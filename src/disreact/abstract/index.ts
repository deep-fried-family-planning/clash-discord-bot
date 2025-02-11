import * as Doken from '#src/disreact/abstract/doken.ts';
import * as DEvent from '#src/disreact/abstract/event.ts';
import * as ATTR from '#src/disreact/internal/dsx-intrinsic/datt.ts';
import * as DFMD from '#src/disreact/internal/dsx-intrinsic/dfmd.ts';
import * as DTML from '#src/disreact/internal/dsx-intrinsic/dtml.ts';
import * as Auth from './auth.ts';
import * as Rest from './rest.ts';

export {
  ATTR,
  Auth,
  DEvent,
  DFMD,
  Doken,
  DTML,
  Rest,
};

export const NONE_STR = '-';
export const NONE_INT = -1;
export const CLOSE    = '.close';
