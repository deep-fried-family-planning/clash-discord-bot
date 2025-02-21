import * as Codec from '#src/disreact/codec/Codec.ts';
import * as Globals from '#src/disreact/model/globals/globals.ts';
import {StaticGraph} from '#src/disreact/model/globals/StaticGraph.ts';
import {initialRender, type RenderFn} from '#src/disreact/model/lifecycle.ts';
import {E} from '#src/internal/pure/effect.ts';



export const synthesize = (fn: RenderFn) => E.gen(function* () {
  yield * E.logFatal(fn.name);

  const frame = Codec.makeStaticFrame(fn.name);

  const Null = Globals.nullifyPointer();
  Globals.mountRoot(Null, frame.state);

  const root     = yield* StaticGraph.cloneRoot(fn);
  const rendered = yield* initialRender(root);
  const encoded  = Codec.encodeMessage(frame, rendered);

  return encoded;
});
