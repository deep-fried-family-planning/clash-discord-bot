import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Rehydrant} from '#src/disreact/model/rehydrant.ts';
import {hole, pipe, S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from './dapi/dapi.ts';
import {Doken} from './doken.ts';
import {Keys} from './rest-elem/keys.ts';

export * as RxTx from './rxtx.ts';
export type RxTx = never;

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


const ModalCustomIdTransform = pipe(
  S.TemplateLiteralParser(
    S.String,
    '/', S.String,
  ),
  S.transform(
    S.Struct({
      root_id  : S.String,
      custom_id: S.String,
    }),
    {
      encode: ({root_id, custom_id}) =>
        [
          root_id, '/', custom_id,
        ] as const,
      decode: ([root_id, , custom_id]) =>
        ({
          root_id,
          custom_id,
        }),
    },
  ),
);

const ModalParamsTransform = S.transform(
  S.typeSchema(DAPI.Modal.Any),
  S.Struct({
    params: ModalCustomIdTransform,
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

export const MessageParamsSerial = S.transform(
  S.TemplateLiteralParser(S.String, '/', Doken.Serial, '/', Rehydrant.Hydrator),
  S.typeSchema(
    S.Struct({
      base   : S.String,
      serial : Doken.Serial,
      hydrant: Rehydrant.Decoded,
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
      hydrant    : S.typeSchema(Rehydrant.Decoded),
      body       : S.typeSchema(DAPI.Ix.ComponentRequestBody),
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
      modal  : ModalCustomIdTransform,
      message: S.optional(MessageParamsTransform),
      request: S.typeSchema(DAPI.Ix.ModalRequestBody),
    }),
    {
      encode: hole,
      decode: (request) =>
        ({
          modal  : request.data.custom_id as any,
          message: request.message,
          request: request,
        }),
    },
  ),
  S.transform(
    S.Struct({
      root_id    : S.String,
      custom_id  : S.String,
      isEphemeral: S.optional(S.Boolean),
      fresh      : Doken.Fresh,
      serial     : S.optional(S.typeSchema(Doken.Serial)),
      hydrant    : S.optional(S.typeSchema(Rehydrant.Decoded)),
      body       : S.typeSchema(DAPI.Ix.ModalRequestBody),
      event      : S.Any,
    }),
    {
      encode: hole,
      decode: ({modal, message, request}) =>
        ({
          root_id    : modal.root_id,
          custom_id  : modal.custom_id,
          isEphemeral: request.message?.flags === 64,
          fresh      : request,
          serial     : message?.params?.serial,
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

export const OutModalTransform = S.transform(
  DAPI.Modal.Open,
  S.Struct({
    base    : S.optional(S.String),
    serial  : S.optional(S.typeSchema(Doken.Serial)),
    hydrant : Rehydrant.Decoded,
    encoding: Elem.declareEncoded(Keys.modal, DAPI.Modal.Open),
  }),
  {
    encode: ({hydrant, encoding}) => ({
      ...encoding.data,
      custom_id: `${hydrant.id}/${encoding.data.custom_id}`,
    }),
    decode: hole,
  },
);

export const OutEphemeralTransform = S.transform(
  MessageParamsTransform,
  S.Struct({
    base    : S.String,
    serial  : S.typeSchema(Doken.Serial),
    hydrant : Rehydrant.Decoded,
    encoding: Elem.declareEncoded(Keys.ephemeral, DAPI.Message.Base),
  }),
  {
    encode: ({base, serial, hydrant, encoding}) => ({
      params: {
        base,
        serial,
        hydrant,
      },
      data: encoding.data,
    }),
    decode: hole,
  },
);

export const OutMessageTransform = S.transform(
  MessageParamsTransform,
  S.Struct({
    base    : S.String,
    serial  : S.typeSchema(Doken.Serial),
    hydrant : Rehydrant.Decoded,
    encoding: Elem.declareEncoded(Keys.message, DAPI.Message.Base),
  }),
  {
    encode: ({base, serial, hydrant, encoding}) => ({
      params: {
        base,
        serial,
        hydrant,
      },
      data: encoding.data,
    }),
    decode: hole,
  },
);

export const OutTransform = S.Union(
  OutModalTransform,
  OutEphemeralTransform,
  OutMessageTransform,
);
