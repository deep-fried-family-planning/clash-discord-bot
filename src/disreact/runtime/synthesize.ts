import {NONE_INT, NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import {Tx} from '#src/disreact/codec/abstract/rest.ts';
import {encodeMessageInteraction} from '#src/disreact/codec/interaction-codec.ts';
import {initialRender, type RenderFn} from '#src/disreact/model/lifecycle.ts';
import {HookDispatch} from '#src/disreact/model/HookDispatch.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import {E} from '#src/internal/pure/effect.ts';



export const synthesize = (fn: RenderFn) => E.gen(function * () {
  HookDispatch.__mallocnull();

  const root = yield * StaticGraph.cloneRoot(fn);
  const rendered = yield * initialRender(root);


  const encoded = encodeMessageInteraction(
    rendered,
    {
      app  : NONE_STR,
      id   : NONE_STR,
      ttl  : NONE_INT,
      token: NONE_STR,
      type : Tx.PONG,
      flags: NONE_INT,
    },
  );

  return encoded;
});
