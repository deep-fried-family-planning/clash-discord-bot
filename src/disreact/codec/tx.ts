import {DAPI} from '#src/disreact/codec/dapi/dapi.ts';
import {Doken} from '#src/disreact/codec/rest/doken.ts';
import {Params} from '#src/disreact/codec/rest/params.ts';
import * as Declarations from '#src/disreact/model/schema/declarations.ts';
import {hole as forbidden} from 'effect/Function';
import * as S from 'effect/Schema';
import * as RestMessage from '#src/disreact/codec/intrinsic/message.ts';
import * as RestModal from '#src/disreact/codec/intrinsic/modal.ts';

export * as Tx from '#src/disreact/codec/tx.ts';
export type Tx = never;

const Modal = S.transform(
  Params.Modal,
  S.Struct({
    base    : S.String,
    doken   : S.typeSchema(Doken.Serial),
    encoding: Declarations.encoded(RestModal.MODAL, DAPI.Modal.Open),
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
      Declarations.encoded(RestMessage.EPHEMERAL, DAPI.Message.Base),
      Declarations.encoded(RestMessage.MESSAGE, DAPI.Message.Base),
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
