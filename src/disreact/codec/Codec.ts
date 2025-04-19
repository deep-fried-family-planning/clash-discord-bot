import {Intrinsic} from '#src/disreact/codec/elem/index.ts';
import {Keys} from '#src/disreact/codec/elem/keys.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {E, S} from '#src/disreact/utils/re-exports.ts';
import {Rx} from '#src/disreact/codec/rx.ts';
import {Tx} from '#src/disreact/codec/tx.ts';

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
