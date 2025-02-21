import type {Rest} from '#src/disreact/codec/rest/index.ts';
import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
import {clickEvent} from '#src/disreact/runtime/flows/click-event.ts';
import {submitEvent} from '#src/disreact/runtime/flows/submit-event.ts';
import {E} from '#src/internal/pure/effect.ts';
import {NodeState} from '../codec/entities';



export const interact = (rest: Rest.Ix) => E.gen(function* () {
  const frame     = yield* DisReactFrame.free();

  yield* DisReactFrame.save(frame);

  switch (frame.event.type) {
  case 'onclick': {
    return yield* clickEvent;
  }
  case 'onsubmit': {
    return yield* submitEvent;
  }
  }
});
