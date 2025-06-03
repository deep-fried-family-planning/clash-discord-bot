import * as DAPI from '#src/disreact/codec/dapi/dapi.ts';
import * as Doken from '#src/disreact/codec/rest/doken.ts';
import * as Params from '#src/disreact/codec/rest/params.ts';
import * as Declarations from '#src/disreact/model/schema/declarations.ts';
import {hole as forbidden} from 'effect/Function';
import * as S from 'effect/Schema';
import * as IntrinsicMessage from '#src/disreact/codec/intrinsic/message.ts';
import * as IntrinsicModal from '#src/disreact/codec/intrinsic/modal.ts';

export * as Tx from '#src/disreact/codec/tx.ts';
export type Tx = never;

const Modal = S.transform(
  Params.Modal,
  S.Struct({
    base    : S.String,
    doken   : S.typeSchema(Doken.Serial),
    encoding: Declarations.encoded(IntrinsicModal.MODAL, DAPI.Modal.Open),
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
      Declarations.encoded(IntrinsicMessage.EPHEMERAL, DAPI.Message.Base),
      Declarations.encoded(IntrinsicMessage.MESSAGE, DAPI.Message.Base),
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
