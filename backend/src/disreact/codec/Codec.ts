import {Rx} from '#src/disreact/codec/rx.ts';
import {Tx} from '#src/disreact/codec/tx.ts';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: () => E.succeed({
    decodeRequest : S.decodeSync(Rx.Request),
    encodeResponse: S.encodeSync(Tx.Response),
  }),
  accessors: true,
}) {}
