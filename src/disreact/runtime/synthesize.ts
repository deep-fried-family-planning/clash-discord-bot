import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import {Tx} from '#src/disreact/codec/rest/rest.ts';
import {HookDispatch} from '#src/disreact/model/hooks/HookDispatch.ts';
import {initialRender, type RenderFn} from '#src/disreact/model/lifecycle.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import {E, RDT} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';



export const synthesize = (fn: RenderFn) => E.gen(function* () {
  HookDispatch.__mallocnull();

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
