import {forbidden, S} from '#src/disreact/utils/re-exports.ts';
import {Declare} from '../model/exp/declare.ts';
import {Keys} from './dapi-elem/keys.ts';
import {DAPI} from './dapi/dapi.ts';
import {Doken} from './doken.ts';
import {Params} from './params.ts';

export * as Tx from './tx.ts';
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
