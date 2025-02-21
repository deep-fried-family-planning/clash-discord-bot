import type {DEvent, Doken, Rest} from '#src/disreact/codec/abstract/index.ts';
import {decodeDialogDoken, decodeMessageDoken, encodeDialogDoken, encodeMessageDoken, makeContingencyDoken} from '#src/disreact/codec/doken-codec.ts';
import {encodeDialogDsx, encodeMessageDsx} from '#src/disreact/codec/dsx-encoder.ts';
import {decodeEvent} from '#src/disreact/codec/event-decoder.ts';
import {decodeDialogRouting, type DecodedRoute, decodeMessageRouting, encodeDialogRouting, encodeMessageRouting} from '#src/disreact/codec/route-codec.ts';
import {decodeStacks, encodeStacks} from '#src/disreact/codec/stack-codec.ts';
import {cloneTree, collectStates, type Pragma, reduceToStacks} from '#src/disreact/model/lifecycle.ts';
import {HookDispatch} from '#src/disreact/model/HookDispatch.ts';
import {DATT} from '#src/disreact/model/index.ts';
import type {HookStacksById } from '#src/disreact/model/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import console from 'node:console';
import {inspect} from 'node:util';



export type DecodedInteraction = {
  start_ms        : number;
  symbol          : symbol;
  contingencyDoken: Doken.T;
  doken           : Doken.T | null;
  event           : DEvent.T;
  params          : DecodedRoute['params'];
  stacks          : HookStacksById;
};



export const decodeInteraction = (rest: Rest.Interaction) => E.gen(function * () {
  yield * E.logInfo('decodeInteraction', inspect(rest, false, null));

  const start_ms         = Date.now();
  const contingencyDoken = makeContingencyDoken(rest);
  contingencyDoken.app   = rest.application_id;
  const event            = decodeEvent(rest);
  const symbol           = HookDispatch.__malloc(rest.id);

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



export const encodeMessageInteraction = (root: Pragma, doken: Doken.T) => {
  const cloned       = cloneTree(root);
  const states       = collectStates(cloned);
  const stacks       = reduceToStacks(states);
  const search       = encodeStacks(stacks);
  const message      = encodeMessageDsx(root);
  const messageDoken = encodeMessageDoken(doken);

  console.log(inspect(stacks, false, null));
  console.log(inspect(message, false, null));

  return encodeMessageRouting(
    {
      params: {
        ...messageDoken,
        root: root.name,
      },
      search,
    },
    message,
  );
};



export const encodeDialogInteraction = (root: Pragma, doken: Doken.T) => E.gen(function * () {
  const cloned      = cloneTree(root);
  const dialog      = encodeDialogDsx(cloned);
  const dialogDoken = yield * encodeDialogDoken(doken);

  return encodeDialogRouting(
    {
      params: {
        ...dialogDoken,
        root: cloned.name,
      },
      search: new URLSearchParams(),
    },
    dialog,
  );
});
