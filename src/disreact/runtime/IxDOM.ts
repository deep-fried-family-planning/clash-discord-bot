import {E, L, pipe} from '#src/disreact/re-exports.ts'
import {DsxSettings} from '#src/disreact/runtime/DisReactConfig.ts'
import {NodeHttpClient} from '@effect/platform-node'
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx'


export class IxDOM extends E.Service<IxDOM>()('disreact/IxDOM', {
  effect: E.gen(function* () {
    const api = yield* DiscordREST

    return {
      discard: (id: string, token: string, body: {type: 7}) =>
        api.createInteractionResponse(id, token, body),

      dismount: (app: string, token: string) =>
        api.deleteOriginalInteractionResponse(app, token),

      defer: (id: string, token: string, body: any) =>
        api.createInteractionResponse(id, token, body),

      create: (id: string, token: string, body: any) =>
        api.createInteractionResponse(id, token, body),

      reply: (app: string, token: string, body: any) =>
        api.editOriginalInteractionResponse(app, token, body),

      // update  : (tx: Operations.Update) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any),
    }
  }),
  accessors: true,

  dependencies: [
    pipe(
      DiscordRESTMemoryLive,
      L.provide([
        NodeHttpClient.layerUndici,
        L.effect(
          DiscordConfig.DiscordConfig,
          E.map(DsxSettings, (config) =>
            DiscordConfig.make({
              token: config.token,
            }),
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
