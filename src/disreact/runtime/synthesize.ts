import * as Codec from '#src/disreact/codec/Codec.ts';
import type {RenderFn} from '#src/disreact/model/lifecycle.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import {E} from '#src/internal/pure/effect.ts';



export const synthesize = (fn: RenderFn) => E.gen(function* () {
  const frame = Codec.makeStaticFrame(fn.name);
  const root  = yield* StaticGraph.synthesizeClone(fn);
  frame.state = root.fiber;

  Globals.nullifyPointer();
  Globals.mountRoot(root.pointer, frame.state);

  const rendered         = yield* Lifecycles.initialRender(root.element);
  frame.state.graph.next = root.root_id;
  const encoded          = Codec.encodeMessage(frame, rendered);

  return encoded;
});
