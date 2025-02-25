import * as Codec from '#src/disreact/codec/Codec.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import type {RenderFn} from '#src/disreact/model/lifecycle.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {E} from '#src/internal/pure/effect.ts';



export const synthesize = (fn: RenderFn) => E.gen(function* () {
  const frame = Codec.makeStaticFrame(fn.name);

  const Null = Globals.nullifyPointer();
  Globals.mountRoot(Null, frame.state);

  const root     = yield* StaticGraph.cloneRoot(fn);
  const rendered = yield* Lifecycles.initialRender(root);
  const encoded  = Codec.encodeMessage(frame, rendered);

  return encoded;
});
