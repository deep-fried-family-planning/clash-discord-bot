import * as Doken from '#src/disreact/codec/abstract/doken.ts';
import * as DEvent from '#src/disreact/codec/abstract/event.ts';
import * as ATTR from '#src/disreact/codec/abstract/attributes.ts';
import * as DFMD from '#src/disreact/codec/abstract/dfmd.ts';
import * as DTML from '#src/disreact/codec/abstract/dtml.ts';
import * as Auth from 'src/disreact/codec/abstract/auth.ts';
import * as Rest from 'src/disreact/codec/abstract/rest.ts';

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
export const CLOSE = '.close';
export const ROOT = '.root';
export const RELAY = '.relay';
export const DASH3 = '---';
