import {g} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Cd, Ix, Route, Tx} from '#src/internal/disreact/entity/index.ts';
import {RouteManager} from '#src/internal/disreact/runtime-old/layers/route-manager.ts';
import type {bool, str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type T = {
  _tag      : 'Dialog';
  isEmpty?  : bool;
  root_id?  : str;
  node_id?  : str;
  onOpen?   : () => void | AnyE<void>;
  onSubmit? : () => void | AnyE<void>;
  custom_id : str;
  title     : str;
  components: Cd.T[][];
  defer     : Tx.Defer;
};


export const makeEmpty = (): T => ({
  _tag      : 'Dialog',
  isEmpty   : true,
  custom_id : '',
  title     : '',
  components: [],
  defer     : Tx.OpenDialog,
});


export const make = (
  title: str,
  components: Cd.T[][],
  onOpen: () => void | AnyE<void> = () => {},
  onSubmit: () => void | AnyE<void> = () => {},
  custom_id: str = '',
  defer: Tx.Defer = Tx.OpenDialog,
): T => ({
  _tag: 'Dialog',
  title,
  components,
  onOpen,
  onSubmit,
  custom_id,
  defer,
});


export const identity = (dialog: unknown) => dialog as T;


export const makeFromRest = g(function * () {
  const rest = yield * RouteManager.rest();

  if (Ix.isRestSubmit(rest, rest.data)) {
    return make(
      NONE,
      Cd.decodeGrid(rest.data.components),
      () => {},
      () => {},
      rest.data.custom_id,
    );
  }

  return makeEmpty();
});


export const encodeToRestOrMemory = (route: Route.T) => (dialog: T) => {
  return {
    custom_id : Route.encode(route),
    title     : dialog.title,
    components: Cd.encodeGrid(dialog.components),
  } as Tx.Dialog;
};
