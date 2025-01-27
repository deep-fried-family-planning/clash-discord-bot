import type {TagFunc} from '#src/disreact/dsx/types.ts';
import {encodeTree} from '#src/disreact/model/tree/codec.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {E} from '#src/internal/pure/effect';



export const synthesize = E.fn('synthesize')(function * (
  type: string | TagFunc,
) {
  const cloned = typeof type === 'string'
    ? yield * StaticDOM.cloneNode(type, type)
    : yield * StaticDOM.cloneNode(type.name, type.name);

  const output = encodeTree(cloned);

  return output;
});
