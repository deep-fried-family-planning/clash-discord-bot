import type {TagFunc} from '#disreact/dsx/types.ts';
import {accumulateStates} from '#disreact/model/tree/dismount.ts';
import {mountTree} from '#disreact/model/tree/mount.ts';
import {renderTree} from '#disreact/model/tree/render.ts';
import {encodeTree} from '#disreact/runtime/codec.ts';
import {StaticDOM} from '#disreact/runtime/layer/StaticDOM.ts';
import {E} from '#pure/effect';
import {inspectLog} from '#src/internal/pure/pure.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



export const synthesize = E.fn('synthesize')(function * (
  type: str | TagFunc,
) {
  inspectLog('')(type.name);

  const cloned = typeof type === 'string'
    ? yield * StaticDOM.cloneNode(type, type)
    : yield * StaticDOM.cloneNode(type.name, type.name);

  const output = encodeTree(cloned);

  inspectLog('synthesize')(output);

  return output;
});
