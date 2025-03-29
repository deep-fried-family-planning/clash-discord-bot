import {DsxSettings} from '#src/disreact/DisReactConfig.ts'
import {E, L, pipe} from '#src/internal/pure/effect.ts'
import {NodeHttpClient} from '@effect/platform-node'
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx'
import type {Operations} from '#src/disreact/codec/operations.ts'


export class InteractionDOM extends E.Service<InteractionDOM>()('disreact/InteractionDOM', {
  accessors: true,

  effect: E.gen(function* () {
    const api = yield* DiscordREST
    const config = yield* DsxSettings

    return {
      discard : (tx: Operations.Discard) => api.createInteractionResponse(tx.id, tx.token, tx.body as any),
      defer   : (tx: Operations.Defer) => api.createInteractionResponse(tx.id, tx.token, tx.body as any),
      create  : (tx: Operations.Create) => api.createInteractionResponse(tx.id, tx.token, tx.body as any),
      reply   : (tx: Operations.Reply) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any),
      // update  : (tx: Operations.Update) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any),
      dismount: (tx: Operations.Dismount) => api.deleteOriginalInteractionResponse(tx.app, tx.token),
    }
  }),

  dependencies: [
    pipe(
      DiscordRESTMemoryLive,
      L.provide([
        NodeHttpClient.layerUndici,
        L.effect(
          DiscordConfig.DiscordConfig,
          pipe(
            DsxSettings,
            E.map((config) =>
              DiscordConfig.make({
                token: config.token,
              }),
            ),
          ),
        ),
      ]),
    ),
  ],
}) {}

// const discard  = (tx: Tx.Discard) => api.createInteractionResponse(tx.id, tx.token, tx.body);
// const defer    = (tx: Tx.Defer) => api.createInteractionResponse(tx.id, tx.token, tx.body);
// const create   = (tx: Tx.Create) => api.createInteractionResponse(tx.id, tx.token, tx.body as any);
// const reply    = (tx: Tx.Reply) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any);
// const update   = (tx: Tx.Update) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any);
// const dismount = (tx: Tx.Dismount) => api.deleteOriginalInteractionResponse(tx.app, tx.token);
