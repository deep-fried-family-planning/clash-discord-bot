import {E, L, pipe} from '#src/disreact/codec/re-exports.ts'
import {RDT} from '#src/internal/pure/effect.ts'
import {NodeHttpClient} from '@effect/platform-node'
import {DiscordREST, DiscordRESTMemoryLive} from 'dfx'

type Token = RDT.Redacted<string>

export class DisReactDOM extends E.Service<DisReactDOM>()('disreact/IxDOM', {
  effect: E.andThen(DiscordREST, (api) =>
    E.succeed({
      discard: (id: string, token: Token, body: {type: 7}) =>
        pipe(
          api.createInteractionResponse(id, RDT.value(token), body),
          E.asVoid,
        ),

      dismount: (app: string, token: Token) =>
        pipe(
          api.deleteOriginalInteractionResponse(app, RDT.value(token)),
          E.asVoid,
        ),

      defer: (id: string, token: Token, body: any) =>
        pipe(
          api.createInteractionResponse(id, RDT.value(token), body),
          E.asVoid,
        ),

      create: (id: string, token: Token, body: any) =>
        pipe(
          api.createInteractionResponse(id, RDT.value(token), body),
          E.asVoid,
        ),

      reply: (app: string, token: Token, body: any) =>
        pipe(
          api.editOriginalInteractionResponse(app, RDT.value(token), body),
          E.asVoid,
        ),
    }),
  ),
  dependencies: [
    pipe(
      DiscordRESTMemoryLive,
      L.provide(NodeHttpClient.layerUndici),
    ),
  ],
}) {}
