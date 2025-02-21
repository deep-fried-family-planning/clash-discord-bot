import {initialRender, type RenderFn} from '#src/disreact/model/lifecycle.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import {E} from '#src/internal/pure/effect.ts';
import * as Globals from '../model/hooks/globals.ts';



export const synthesize = (fn: RenderFn) => E.gen(function* () {
  Globals.nullifyPointer();

  const root     = yield* StaticGraph.cloneRoot(fn);
  const rendered = yield* initialRender(root);

  //
  // const encoded = encodeMessageInteraction(
  //   rendered,
  //   {
  //     _tag     : 'Doken',
  //     app_id   : NONE_STR,
  //     id       : NONE_STR,
  //     ttl      : DateTime.unsafeMake(0),
  //     token    : RDT.make(NONE_STR),
  //     type     : Tx.PONG,
  //     ephemeral: 0,
  //     status   : 'Spent',
  //   },
  // );

  return {} as any;
});
