import type {Rest} from '#src/disreact/abstract/index.ts';
import {decodeInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {clickEvent} from '#src/disreact/runtime/flows/click-event.ts';
import {submitEvent} from '#src/disreact/runtime/flows/submit-event.ts';
import {emptyHooks} from '#src/disreact/internal/index.ts';
import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
import {E} from '#src/internal/pure/effect.ts';



export const interact = (rest: Rest.Ix) => E.gen(function * () {
  const frame     = yield * DisReactFrame.free();
  const data   = yield * decodeInteraction(rest);
  frame.start_ms  = data.start_ms;
  frame.pointer   = data.symbol;
  frame.rx.rest   = rest;
  frame.restDoken = data.contingencyDoken;
  frame.doken     = data.doken;
  frame.rx.params = data.params;

  frame.stacks    = data.stacks;
  frame.event     = data.event;
  frame.root      = data.params.root;
  frame.rx.states = {};

  frame.context = {
    next: frame.rx.params.root,
    rest: frame.rest,
  };

  for (const [id, stack] of Object.entries(frame.stacks)) {
    frame.rx.states[id]       = emptyHooks(id);
    frame.rx.states[id].stack = stack;
    frame.rx.states[id].rc    = 1;
  }

  yield * DisReactFrame.save(frame);

  switch (frame.event.type) {
    case 'onclick': {
      return yield * clickEvent;
    }
    case 'onsubmit': {
      return yield * submitEvent;
    }
  }
});
