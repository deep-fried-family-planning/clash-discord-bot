import * as DAPI from '#src/disreact/adaptor/codec/dapi/dapi.ts';
import * as Doken from '#src/disreact/adaptor/codec/doken.ts';
import * as Container from '#src/disreact/adaptor/codec/intrinsic/container.ts';
import * as Params from '#src/disreact/adaptor/codec/params.ts';
import * as Declarations from '#src/disreact/adaptor/codec/old/declarations.ts';
import {hole as forbidden, pipe} from 'effect/Function';
import * as S from 'effect/Schema';

export * as Rx from '#src/disreact/adaptor/codec/rx.ts';
export type Rx = never;

const Modal = pipe(
  DAPI.Ix.ModalRequestBody,
  S.transform(
    S.Struct({
      body   : S.typeSchema(DAPI.Ix.ModalRequestBody),
      fresh  : Doken.LatestFromRequest,
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
      fresh      : S.typeSchema(Doken.LatestFromRequest),
      doken      : S.optional(S.typeSchema(Doken.Serial)),
      hydrator   : S.typeSchema(Declarations.Hydrator),
      event      : Declarations.trigger(DAPI.Modal.Data),
      message    : S.optional(S.typeSchema(Declarations.Hydrator)),
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
  S.attachPropertySignature('_tag', Container.MODAL),
);

const Message = pipe(
  DAPI.Ix.ComponentRequestBody,
  S.transform(
    S.Struct({
      body   : S.typeSchema(DAPI.Ix.ComponentRequestBody),
      fresh  : Doken.LatestFromRequest,
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
      fresh      : S.typeSchema(Doken.LatestFromRequest),
      doken      : S.typeSchema(Doken.Serial),
      hydrator   : S.typeSchema(Declarations.Hydrator),
      event      : Declarations.trigger(DAPI.Ix.ComponentData),
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
  S.attachPropertySignature('_tag', Container.MESSAGE),
);

export const Request = S.Union(
  Modal,
  Message,
);

export type Request = typeof Request.Type;
