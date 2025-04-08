import {Fibril, Hydrant} from '#src/disreact/model/comp/fibril.ts';
import {hole, pipe, S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from './dapi/dapi.ts';
import {Doken} from './doken.ts';

export * as RxTx from './rxtx.ts';
export type RxTx = never;

export const DEFAULT_BASE_URL = 'https://dffp.org';
export const MESSAGE = 'Message';
export const MODAL = 'Modal';

export const ModalParamsSerial = S.transform(
  S.TemplateLiteralParser(
    Doken.Serial,
    '/', S.String,
  ),
  S.typeSchema(
    S.Struct({
      id    : S.String,
      serial: Doken.Serial,
    }),
  ),
  {
    encode: ({id, serial}) =>
      [
        serial, '/', id,
      ] as const,
    decode: ([serial, , id]) =>
      ({
        id    : id,
        serial: serial,
      }),
  },
);

export const MessageParamsSerial = S.transform(
  S.TemplateLiteralParser(S.String, '/', Doken.Serial, '/', Fibril.Hydrant),
  S.typeSchema(
    S.Struct({
      base   : S.String,
      serial : Doken.Serial,
      hydrant: Fibril.Hydrant,
    }),
  ),
  {
    encode: ({base, serial, hydrant}) =>
      [
        base, '/', serial, '/', hydrant,
      ] as const,
    decode: ([base, , doken, , hydrant]) =>
      ({
        base   : base,
        serial : doken,
        hydrant: hydrant,
      }),
  },
);

export const MessageParamsTransform = S.transform(
  S.typeSchema(DAPI.Message.Base),
  S.Struct({
    params: MessageParamsSerial,
    data  : S.typeSchema(DAPI.Message.Base),
  }),
  {
    encode: ({params, data}) =>
      ({
        ...data,
        embeds: data.embeds?.with(0, {
          ...data.embeds.at(0),
          image: {
            ...data.embeds.at(0)?.image,
            url: params,
          },
        }),
      }),
    decode: (data) => {
      if (!data.embeds?.[0].image?.url) {
        throw new Error();
      }
      return {
        params: data.embeds[0].image.url as any,
        data  : data,
      };
    },
  },
);

export const ModalParamsTransform = S.transform(
  S.typeSchema(DAPI.Modal.Any),
  S.Struct({
    params: ModalParamsSerial,
    data  : S.typeSchema(DAPI.Modal.Any),
  }),
  {
    encode: ({params, data}) =>
      ({
        ...data,
        custom_id: params,
      }),
    decode: (modal) =>
      ({
        params: modal.custom_id as any,
        data  : modal,
      }),
  },
);

export const MessageParamsRequest = pipe(
  DAPI.Ix.ComponentRequestBody,
  S.transform(
    S.Struct({
      message: MessageParamsTransform,
      request: S.typeSchema(DAPI.Ix.ComponentRequestBody),
    }),
    {
      encode: hole,
      decode: (request) =>
        ({
          message: request.message,
          request: request,
        }),
    },
  ),
  S.transform(
    S.Struct({
      isEphemeral: S.optional(S.Boolean),
      base       : S.String,
      fresh      : Doken.Fresh,
      serial     : S.typeSchema(Doken.Serial),
      hydrant    : S.typeSchema(Hydrant.to),
      body       : S.typeSchema(DAPI.Ix.RequestBody),
      event      : S.Any,
    }),
    {
      encode: hole,
      decode: ({message, request}) =>
        ({
          isEphemeral: request.message?.flags === 64,
          fresh      : request,
          base       : message.params.base,
          serial     : message.params.serial,
          hydrant    : message.params.hydrant,
          body       : request,
          event      : {},
        }),
    },
  ),
  S.attachPropertySignature('_tag', MESSAGE),
  S.mutable,
);

export const ModalParamsRequest = pipe(
  DAPI.Ix.ModalRequestBody,
  S.transform(
    S.Struct({
      modal  : ModalParamsTransform,
      message: S.optional(MessageParamsTransform),
      request: S.typeSchema(DAPI.Ix.ModalRequestBody),
    }),
    {
      encode: hole,
      decode: (request) =>
        ({
          modal  : request.data,
          message: request.message,
          request: request,
        }),
    },
  ),
  S.transform(
    S.Struct({
      isEphemeral: S.optional(S.Boolean),
      base       : S.optional(S.String),
      fresh      : Doken.Fresh,
      serial     : S.typeSchema(Doken.Serial),
      hydrant    : S.optional(S.typeSchema(Hydrant)),
      body       : S.typeSchema(DAPI.Ix.ModalRequestBody),
      event      : S.Any,
    }),
    {
      encode: hole,
      decode: ({modal, message, request}) =>
        ({
          isEphemeral: request.message?.flags === 64,
          fresh      : request,
          serial     : message?.params?.serial ?? modal.params.serial,
          hydrant    : message?.params?.hydrant,
          body       : request,
          event      : {},
        }),
    },
  ),
  S.attachPropertySignature('_tag', MODAL),
  S.mutable,
);

export const ParamsRequest = S.Union(
  MessageParamsRequest,
  ModalParamsRequest,
);
export type ParamsRequest = typeof ParamsRequest.Type;

export const MessageResponse = S.transform(
  MessageParamsTransform,
  S.Struct({
    base   : S.String,
    serial : S.typeSchema(Doken.Serial),
    hydrant: Hydrant.to,
    data   : DAPI.Message.Base,
  }),
  {
    encode: ({base, data, hydrant, serial}) =>
      ({
        params: {
          base   : base,
          serial : serial,
          hydrant: hydrant,
        },
        data: data,
      }),
    decode: hole,
  },
);

export const ModalResponse = S.transform(
  ModalParamsTransform,
  S.Struct({
    base   : S.String,
    serial : S.typeSchema(Doken.Serial),
    hydrant: Hydrant.to,
    data   : DAPI.Modal.Any,
  }),
  {
    encode: ({base, data, hydrant, serial}) =>
      ({
        params: {
          id    : hydrant.id,
          serial: serial,
        },
        data: data,
      }),
    decode: hole,
  },
);

export const ParamsResponse = S.Union(
  MessageResponse.pipe(S.attachPropertySignature('_tag', MESSAGE), S.mutable),
  ModalResponse.pipe(S.attachPropertySignature('_tag', MODAL), S.mutable),
);
export type ParamsResponse = typeof ParamsResponse.Type;


export const ModalOutput = pipe(
  S.Struct({
    hydrant: Hydrant,
    data   : DAPI.Modal.Open,
  }),
  S.attachPropertySignature('_tag', 'Modal'),
);

export const PublicMessageOutput = pipe(
  S.Struct({
    hydrant: Hydrant,
    data   : DAPI.Message.Base,
  }),
  S.attachPropertySignature('_tag', 'Public'),
);

export const EphemeralMessageOutput = pipe(
  S.Struct({
    hydrant: Hydrant,
    data   : DAPI.Message.Ephemeral,
  }),
  S.attachPropertySignature('_tag', 'Ephemeral'),
);

export const Output = S.Union(
  ModalOutput,
  PublicMessageOutput,
  EphemeralMessageOutput,
);
