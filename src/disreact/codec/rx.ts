import {forbidden, pipe, S} from '#src/disreact/utils/re-exports.ts';
import {Rehydrant} from '../model/elem/rehydrant.ts';
import {Declare} from '../model/exp/declare.ts';
import {Keys} from './dapi-elem/keys.ts';
import {DAPI} from './dapi/dapi.ts';
import {Doken} from './doken.ts';
import {Params} from './params.ts';

export * as Rx from './rx.ts';
export type Rx = never;

const Modal = pipe(
  DAPI.Ix.ModalRequestBody,
  S.transform(
    S.Struct({
      body   : S.typeSchema(DAPI.Ix.ModalRequestBody),
      fresh  : Doken.Fresh,
      modal  : Params.Modal,
      message: S.optional(Params.Message),
    }),
    {
      encode: forbidden,
      decode: (body) =>
        ({
          body,
          fresh  : body,
          modal  : body.data,
          message: body.message,
        }),
    },
  ),
  S.transform(
    S.Struct({
      body       : S.typeSchema(DAPI.Ix.ModalRequestBody),
      isEphemeral: S.optional(S.Boolean),
      fresh      : S.typeSchema(Doken.Fresh),
      doken      : S.optional(S.typeSchema(Doken.Serial)),
      hydrator   : S.typeSchema(Rehydrant.Decoded),
      event      : Declare.trigger(DAPI.Modal.Data),
      message    : S.optional(S.typeSchema(Rehydrant.Decoded)),
    }),
    {
      encode: forbidden,
      decode: (body) =>
        ({
          body       : body.body,
          isEphemeral: body.message?.data.flags === 64,
          fresh      : body.fresh,
          doken      : body.message?.params?.doken,
          hydrator   : {
            id    : body.modal.params.source_id,
            props : {},
            stacks: {},
          },
          event: {
            id  : body.modal.params.custom_id,
            data: body.modal.data,
          },
          message: body.message?.params?.hydrator,
        }),
    },
  ),
  S.attachPropertySignature('_tag', Keys.modal),
);

const Message = pipe(
  DAPI.Ix.ComponentRequestBody,
  S.transform(
    S.Struct({
      body   : S.typeSchema(DAPI.Ix.ComponentRequestBody),
      fresh  : Doken.Fresh,
      message: Params.Message,
    }),
    {
      encode: forbidden,
      decode: (body) =>
        ({
          body,
          fresh  : body,
          message: body.message,
        }),
    },
  ),
  S.transform(
    S.Struct({
      body       : S.typeSchema(DAPI.Ix.ComponentRequestBody),
      isEphemeral: S.Boolean,
      fresh      : S.typeSchema(Doken.Fresh),
      doken      : S.typeSchema(Doken.Serial),
      hydrator   : S.typeSchema(Rehydrant.Decoded),
      event      : Declare.trigger(DAPI.Ix.ComponentData),
    }),
    {
      encode: forbidden,
      decode: (body) =>
        ({
          body       : body.body,
          isEphemeral: body.body.message.flags === 64,
          fresh      : body.fresh,
          doken      : body.message.params.doken,
          hydrator   : body.message.params.hydrator,
          event      : {
            id  : body.body.data.custom_id,
            data: body.body.data,
          },
        }),
    },
  ),
  S.attachPropertySignature('_tag', Keys.message),
);

export const Request = S.Union(
  Modal,
  Message,
);

export type Request = typeof Request.Type;
