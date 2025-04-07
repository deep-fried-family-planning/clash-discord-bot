import {Fibril, Hydrant} from '#src/disreact/model/comp/fibril.ts'
import {hole, pipe, S} from '#src/disreact/utils/re-exports.ts'
import {DAPI} from './dapi/dapi.ts'
import {Doken} from './doken.ts'

export * as RxTx from './rxtx.ts'
export type RxTx = never

export const DEFAULT_BASE_URL = 'https://dffp.org'

export type Params = typeof Params.Type
export const Params = S.transform(
  S.TemplateLiteralParser(
    S.String,
    '/', Doken.Serial,
    '/', Fibril.Hydrant,
  ),
  S.typeSchema(
    S.Struct({
      base   : S.String,
      doken  : Doken.Serial,
      hydrant: Fibril.Hydrant,
    }),
  ),
  {
    encode: ({base, doken, hydrant}) => [
      base, '/', doken, '/', hydrant,
    ] as const,
    decode: ([base, , doken, , hydrant]) => ({
      base,
      doken,
      hydrant,
    }),
  },
)

export const ParamsFromMessage = S.transform(
  DAPI.Message.Base,
  S.Tuple(Params, S.typeSchema(DAPI.Message.Base)),
  {
    encode: ([params, message]) => ({
      ...message,
      embeds: message.embeds?.with(0, {
        ...message.embeds.at(0),
        image: {
          ...message.embeds.at(0)?.image,
          url: params,
        },
      }),
    }),
    decode: (message) => {
      if (!message.embeds?.[0].image?.url) {
        throw new Error()
      }
      return [message.embeds[0].image.url as any, message] as const
    },
  },
)

export type RouteDecoding = typeof RouteDecoding.Type
export const RouteDecoding = pipe(
  DAPI.Ix.Body,
  S.transform(
    S.Tuple(Doken.Fresh, ParamsFromMessage, S.typeSchema(DAPI.Ix.Body)),
    {
      strict: true,
      encode: hole,
      decode: (request) => [
        request, request.message!, request,
      ] as const,
    },
  ),
  S.transform(
    S.Struct({
      base    : S.String,
      fresh   : S.typeSchema(Doken.Fresh),
      defer   : S.optional(S.typeSchema(Doken.Serial)),
      hydrant : S.typeSchema(Hydrant.to),
      message : S.typeSchema(DAPI.Message.Base),
      original: S.typeSchema(DAPI.Ix.Body),
    }),
    {
      encode: hole,
      decode: ([fresh, [params, message], request]) => ({
        original: request,
        message : message,
        base    : params.base,
        fresh   : fresh,
        defer   : params.doken,
        hydrant : params.hydrant,
      }),
    },
  ),
)

export type RouteEncoding = typeof RouteEncoding.Type
export const RouteEncoding = ParamsFromMessage
