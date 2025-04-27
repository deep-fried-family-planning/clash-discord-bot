import {DAPI} from '#src/disreact/codec/dapi/dapi.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Doken} from '#src/disreact/codec/rest/doken.ts';
import {Params} from '#src/disreact/codec/rest/params.ts';
import {Declare} from '#src/disreact/model/declare.ts';
import {forbidden, S} from '#src/disreact/utils/re-exports.ts';

export * as Tx from '#src/disreact/codec/tx.ts';
export type Tx = never;

const Modal = S.transform(
  Params.Modal,
  S.Struct({
    base    : S.String,
    doken   : S.typeSchema(Doken.Serial),
    encoding: Declare.encoded(Keys.modal, DAPI.Modal.Open),
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
      Declare.encoded(Keys.ephemeral, DAPI.Message.Base),
      Declare.encoded(Keys.message, DAPI.Message.Base),
      Declare.encoded(Keys.entry, DAPI.Message.Base),
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
  Modal,
  Message,
);

export type Response = typeof Response.Type;
