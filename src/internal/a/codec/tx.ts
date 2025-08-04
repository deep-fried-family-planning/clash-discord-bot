import * as DAPI from '#src/internal/a/codec/dapi/dapi.ts';
import * as Doken from '#src/internal/a/codec/doken.ts';
import * as Container from '#src/internal/a/intrinsic/container.ts';
import * as Params from '#src/internal/a/codec/params.ts';
import * as Declarations from '#src/internal/a/codec/old/declarations.ts';
import {hole as forbidden} from 'effect/Function';
import * as S from 'effect/Schema';

export * as Tx from '#src/internal/a/codec/tx.ts';
export type Tx = never;

const Modal = S.transform(
  Params.Modal,
  S.Struct({
    base    : S.String,
    doken   : S.typeSchema(Doken.Serial),
    encoding: Declarations.encoded(Container.MODAL, DAPI.Modal.Open),
  }),
  {
    encode: (tx) =>
      ({
        params: {
          source_id: tx.encoding.hydrator.id,
          custom_id: tx.encoding.data.custom_id,
        },
        data: tx.encoding.data,
      }),
    decode: forbidden,
  },
);

const Message = S.transform(
  Params.Message,
  S.Struct({
    base    : S.String,
    doken   : S.typeSchema(Doken.Serial),
    encoding: S.Union(
      Declarations.encoded(Container.EPHEMERAL, DAPI.Message.Base),
      Declarations.encoded(Container.MESSAGE, DAPI.Message.Base),
    ),
  }),
  {
    encode: (tx) =>
      ({
        params: {
          base    : tx.base,
          doken   : tx.doken,
          hydrator: tx.encoding.hydrator,
        },
        data: tx.encoding.data,
      }),
    decode: forbidden,
  },
);

export const Response = S.Union(
  Message,
  Modal,
);

export type Response = typeof Response.Type;
