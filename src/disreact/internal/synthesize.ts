import {NONE_INT, NONE_STR} from '#src/disreact/abstract/index.ts';
import {Tx} from '#src/disreact/abstract/rest.ts';
import {encodeMessageInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {__mallocnull} from '#src/disreact/internal/dsx/globals.ts';
import {initialRender, rerenderRoot} from '#src/disreact/internal/dsx/lifecycle.ts';
import {StaticDOM} from '#src/disreact/internal/layer/StaticDOM.ts';
import type {RenderFn} from '#src/disreact/internal/types.ts';
import {E} from '#src/internal/pure/effect.ts';



export const synthesize = (fn: RenderFn) => E.gen(function * () {
  __mallocnull();

  const root = yield * StaticDOM.checkoutRoot(fn);
  const rendered = initialRender(root);


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
