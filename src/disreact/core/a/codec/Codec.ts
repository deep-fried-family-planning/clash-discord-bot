import {Rx} from '#disreact/core/a/codec/rx.ts';
import {Tx} from '#disreact/core/a/codec/tx.ts';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: () => E.succeed({
    decodeRequest : S.decodeSync(Rx.Request),
    encodeResponse: S.encodeSync(Tx.Response),
  }),
  accessors: true,
}) {}
