import type {Driver} from '#discord/context/model-driver.ts';
import type {Nx} from '#discord/entities';
import {type Cv, Cx, type Nv, type Tx} from '#discord/entities';
import {type Hooks, makeEmptyHooks} from '#discord/hooks/hooks.ts';
import type {IxIn} from '#discord/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const enum IxDefer {
  unknown,
  click_entry,
  click_ephemeral,
  open_dialog,
  submit_dialog,
}


export type InteractionContext = {
  driver   : Driver;
  hooks    : Hooks;
  server_id: str;
  user_id  : str;

  ix     : IxIn;
  ix_prev: IxIn;

  ax: {
    path : Cx.Path;
    rest : Cx.T;
    view : Cv.T;
    data : Cx.T;
    event: unknown;
  };

  curr: {
    rest: Nx.T;
    view: Nv.T;
    data: Nx.T;
  };
  next: {
    rest: Nx.T;
    view: Nv.T;
    data: Nx.T;
  };

  dialog: {
    init: IxIn;
    rest: Nx.T;
    view: Nv.T;
    data: Nx.T;
    sent: Tx.T;
  };
  message: {
    init: IxIn;
    rest: Nx.T;
    view: Nv.T;
    data: Nx.T;
    sent: Tx.T;
  };
};


export const emptyIxContext = () => ({
  driver: {},
  hooks : makeEmptyHooks(),

  server_id: '',
  user_id  : '',

  ix     : {},
  ix_prev: {},

  ax: {
    path : Cx.Path.empty(),
    rest : {},
    view : {},
    data : {},
    event: {},
  },

  curr: {
    rest: {},
    view: {},
    data: {},
  },

  next: {
    rest: {},
    view: {},
    data: {},
  },

  dialog : {},
  message: {},
} as InteractionContext);
