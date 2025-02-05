import {StaticDOM} from '#src/disreact/internal/layer/StaticDOM.ts';
import type {RenderFn} from '#src/disreact/internal/types.ts';
import {E} from '#src/internal/pure/effect.ts';



export const synthesize = (fn: RenderFn) => E.gen(function * () {
  const root = yield * StaticDOM.checkoutRoot(fn.name);
});
