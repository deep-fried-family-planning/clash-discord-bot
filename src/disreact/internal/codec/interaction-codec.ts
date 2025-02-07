import type {DEvent, Doken, Rest} from '#src/disreact/abstract/index.ts';
import {decodeDialogDoken, decodeMessageDoken, encodeDialogDoken, encodeMessageDoken, makeContingencyDoken} from '#src/disreact/internal/codec/doken-codec.ts';
import {encodeDialogDsx, encodeMessageDsx} from '#src/disreact/internal/codec/dsx-encoder.ts';
import {decodeEvent} from '#src/disreact/internal/codec/event-decoder.ts';
import {decodeDialogRouting, type DecodedRoute, decodeMessageRouting, encodeDialogRouting, encodeMessageRouting} from '#src/disreact/internal/codec/route-codec.ts';
import {decodeStacks, encodeStacks} from '#src/disreact/internal/codec/stack-codec.ts';
import {DATT} from '#src/disreact/internal/dsx/index.ts';
import {__malloc, cloneTree, collectStates, reduceToStacks} from '#src/disreact/internal/index.ts';
import type {Pragma, StacksById} from '#src/disreact/internal/types.ts';
import {E} from '#src/internal/pure/effect.ts';



export type DecodedInteraction = {
  start_ms        : number;
  symbol          : symbol;
  contingencyDoken: Doken.T;
  doken           : Doken.T | null;
  event           : DEvent.T;
  params          : DecodedRoute['params'];
  stacks          : StacksById;
};



export const decodeInteraction = (rest: Rest.Interaction) => E.gen(function * () {
  const start_ms         = Date.now();
  const contingencyDoken = makeContingencyDoken(rest);
  contingencyDoken.app   = rest.application_id;
  const event            = decodeEvent(rest);
  const symbol           = __malloc(rest.id);

  if (event.type === DATT.onclick) {
    const route = decodeMessageRouting(rest);
    const doken = decodeMessageDoken(route);

    if (doken) {
      doken.app = rest.application_id;
    }

    return {
      start_ms,
      symbol,
      contingencyDoken,
      doken,
      event,
      params: route.params,
      stacks: decodeStacks(route.search),
    } satisfies DecodedInteraction;
  }

  const route = decodeDialogRouting(rest);
  const doken = yield * decodeDialogDoken(route);

  if (doken) {
    doken.app = rest.application_id;
  }

  return {
    start_ms,
    symbol,
    contingencyDoken,
    doken,
    event,
    params: route.params,
    stacks: decodeStacks(route.search),
  };
});



export const encodeMessageInteraction = (root: Pragma, params: DecodedRoute['params'], doken: Doken.T) => {
  const cloned       = cloneTree(root);
  const states       = collectStates(cloned);
  const stacks       = reduceToStacks(states);
  const search       = encodeStacks(stacks);
  const message      = encodeMessageDsx(root);
  const messageDoken = encodeMessageDoken(doken);

  return encodeMessageRouting(
    {
      params: {
        ...messageDoken,
        root: params.root,
      },
      search,
    },
    message,
  );
};



export const encodeDialogInteraction = (root: Pragma, params: DecodedRoute['params'], doken: Doken.T) => E.gen(function * () {
  const cloned      = cloneTree(root);
  const dialog      = encodeDialogDsx(cloned);
  const dialogDoken = yield * encodeDialogDoken(doken);

  return encodeDialogRouting(
    {
      params: {
        ...dialogDoken,
        root: params.root,
      },
      search: new URLSearchParams(),
    },
    dialog,
  );
});
