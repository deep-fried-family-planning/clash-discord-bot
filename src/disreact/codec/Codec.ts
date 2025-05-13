import {Intrinsic} from '#src/disreact/codec/intrinsic/index.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Rx} from '#src/disreact/codec/rx.ts';
import {Tx} from '#src/disreact/codec/tx.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

export class Codec extends Effect.Service<Codec>()('disreact/Codec', {
  effect: DisReactConfig.use(() => {
    return {
      primitive     : Keys.primitive,
      normalization : Intrinsic.NORM,
      encoding      : Intrinsic.ENC,
      decodeRequest : Schema.decodeSync(Rx.Request),
      encodeResponse: Schema.encodeSync(Tx.Response),
    };
  }),
  accessors: true,
}) {}
