import {Intrinsic} from '#src/disreact/codec/intrinsic/index.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Rx} from '#src/disreact/codec/rx.ts';
import {Tx} from '#src/disreact/codec/tx.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {E, S} from '#src/disreact/utils/re-exports.ts';

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: DisReactConfig.use(() => {
    return {
      primitive     : Keys.primitive,
      normalization : Intrinsic.NORM,
      encoding      : Intrinsic.ENC,
      decodeRequest : S.decodeSync(Rx.Request),
      encodeResponse: S.encodeSync(Tx.Response),
    };
  }),
  accessors: true,
}) {}
