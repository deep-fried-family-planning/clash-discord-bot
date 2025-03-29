import {Doken} from '#src/disreact/codec/doken.ts'
import {Fibril} from '#src/disreact/model/fibril/fibril.ts'
import {S} from '#src/disreact/re-exports.ts'
import {DAPIMessage} from 'src/disreact/codec/rest/dapi-message.ts'

export * as Params from '#src/disreact/codec/params.ts'
export type Params = never

export const MessageParams = S.Struct({
  id     : S.String,
  doken  : S.asSchema(Doken.D),
  hydrant: Fibril.Hydrant,
})

export const MessageSerial = S.TemplateLiteralParser(
  'https://dffp.org/', Doken.D,
  '/', S.String,
  '/', Fibril.Hydrant,
)

export const MessageTransform = S.transform(MessageSerial, MessageParams, {
  strict: false,
  decode: ([, doken, , id, , hydrant]) =>
    ({
      id,
      doken,
      hydrant,
    } as const),
  encode: ({doken, id, hydrant}) =>
    [
      'https://dffp.org/', doken, '/', id, '/', hydrant,
    ] as const,
})

export const MessageParamsFromMessage = S.transform(DAPIMessage.Base, MessageTransform, {
  strict: false,
  decode: (message) => {
    if (!message.embeds?.[0].image?.url) {
      throw new Error()
    }
    return message.embeds[0].image.url
  },
  encode: () => {throw new Error()},
})

export const MessageParamsToMessage = S.transform(DAPIMessage.Base, S.Tuple(MessageTransform, DAPIMessage.Base), {
  strict: false,
  decode: () => {throw new Error()},
  encode: ([params, message]) =>
    ({
      ...message,
      embeds: message.embeds?.with(0, {
        ...message.embeds.at(0),
        image: {
          ...message.embeds.at(0)?.image,
          url: params,
        },
      }),
    }),
})
