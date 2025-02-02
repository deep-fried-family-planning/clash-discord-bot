import * as DAuth from '#src/disreact/abstract/dauth.ts';
import * as Doken from '#src/disreact/abstract/doken.ts';
import * as Events from '#src/disreact/runtime/enum/events.ts';
import * as Rest from '#src/disreact/runtime/enum/rest.ts';
import * as DRoute from '#src/disreact/runtime/enum/droute.ts';
import * as DAction from '#src/disreact/abstract/devent.ts';
import * as Out from '#src/disreact/runtime/enum/out.ts';


export const NONE     = '-';
export const NONE_INT = -1;

export {
  DAction,
  DAuth,
  Doken,
  DRoute,
  Events,
  Rest,
  Out,
};

export const enum PAGE {
  CLOSE = '0close',
}
