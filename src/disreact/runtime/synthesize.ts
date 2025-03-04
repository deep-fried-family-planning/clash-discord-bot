import * as Codec from '#src/disreact/codec/Codec.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {StaticModel} from '#src/disreact/model/StaticModel.ts';
import {E} from '#src/internal/pure/effect.ts';
import type * as FC from '../codec/element/function-component.ts';



export const synthesize = (fn: FC.FC) => E.gen(function* () {
  const frame = Codec.makeStaticFrame(fn.name);
  const root  = yield* StaticModel.synthesizeClone(fn);
  frame.state = root.fiber;

  Globals.nullifyPointer();
  Globals.mountRoot(root.pointer, frame.state);

  const rendered         = yield* Lifecycles.initialRender(root.element);
  frame.state.graph.next = root.root_id;
  const encoded          = Codec.encodeMessage(frame, rendered);

  return encoded;
});
