import type {Pragma} from '#src/disreact/dsx/lifecycle.ts';
import {E} from '#src/internal/pure/effect.ts';



export const nope = (root: Pragma) => E.gen(function * () {
  if (root.kind === 'text') {

  }
});
