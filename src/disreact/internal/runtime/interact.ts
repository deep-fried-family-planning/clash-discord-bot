import type {Rest} from '#src/disreact/abstract/index.ts';
import {decodeInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {clickEvent} from '#src/disreact/internal/runtime/flows/click-event.ts';
import {submitEvent} from '#src/disreact/internal/runtime/flows/submit-event.ts';
import {emptyHooks} from '#src/disreact/internal/index.ts';
import {DisReactFrame} from '#src/disreact/internal/runtime/DisReactFrame.ts';
import {E} from '#src/internal/pure/effect.ts';



export const interact = (rest: Rest.Ix) => E.gen(function * () {
  const ix     = yield * DisReactFrame.free();
  const data   = yield * decodeInteraction(rest);
  ix.start_ms  = data.start_ms;
  ix.pointer   = data.symbol;
  ix.rx.rest   = rest;
  ix.restDoken = data.contingencyDoken;
  ix.doken     = data.doken;
  ix.rx.params = data.params;

  ix.stacks    = data.stacks;
  ix.event     = data.event;
  ix.root      = data.params.root;
  ix.rx.states = {};

  ix.context = {
    next: ix.rx.params.root,
    rest: ix.rest,
  };

  for (const [id, stack] of Object.entries(ix.stacks)) {
    ix.rx.states[id]       = emptyHooks(id);
    ix.rx.states[id].stack = stack;
    ix.rx.states[id].rc    = 1;
  }

  yield * DisReactFrame.save(ix);

  switch (ix.event.type) {
    case 'onclick': {
      return yield * clickEvent;
    }
    case 'onsubmit': {
      return yield * submitEvent;
    }
  }
});
