import {DisReactFrame} from '#src/disreact/internal/runtime/DisReactFrame.ts';
import {E} from '#src/internal/pure/effect.ts';



export const submitEvent = E.gen(function * () {
  const ix = yield * DisReactFrame.read();
});
