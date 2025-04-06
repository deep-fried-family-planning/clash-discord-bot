import {Doken} from '#src/disreact/codec/doken.ts'
import {Fibril} from '#src/disreact/model/comp/fibril.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import {DAPIMessage} from 'src/disreact/codec/rest/dapi-message.ts'

export * as Params from '#src/disreact/codec/params.ts'
export type Params = never

export type Msg = typeof MessageParams.Type

export const MessageParams = S.Struct({
  doken  : Doken.T,
  hydrant: Fibril.Hydrant,
})

export const MessageSerial = S.TemplateLiteralParser(
  'https://dffp.org/', Doken.D,
  '/', Fibril.Hydrant.from,
)

export const MessageTransform = S.transform(MessageSerial, MessageParams, {
  strict: true,
  decode: ([, doken, , hydrant]) =>
    ({
      doken,
      hydrant,
    } as const),
  encode: ({doken, hydrant}) =>
    [
      'https://dffp.org/', doken, '/', hydrant,
    ] as const,
})

export const MessageParamsFromMessage = S.transform(DAPIMessage.Base, MessageTransform, {
  strict: true,
  decode: (message) => {
    if (!message.embeds?.[0].image?.url) {
      throw new Error()
    }
    return message.embeds[0].image.url as any
  },
  encode: () => {throw new Error()},
})

export const MessageParamsToMessage = S.transform(DAPIMessage.Base, S.Tuple(MessageTransform, DAPIMessage.Base), {
  strict: true,
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
