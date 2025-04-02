import {E, L, pipe} from '#src/disreact/re-exports.ts'
import {DsxSettings} from '#src/disreact/runtime/config/DisReactConfig.ts'
import {RDT} from '#src/internal/pure/effect.ts'
import {NodeHttpClient} from '@effect/platform-node'
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx'


export class IxDOM extends E.Service<IxDOM>()('disreact/IxDOM', {
  effect: E.gen(function* () {
    const api = yield* DiscordREST

    return {
      discard: (id: string, token: RDT.Redacted<string>, body: {type: 7}) =>
        api.createInteractionResponse(id, RDT.value(token), body),

      dismount: (app: string, token: RDT.Redacted<string>) =>
        api.deleteOriginalInteractionResponse(app, RDT.value(token)),

      defer: (id: string, token: RDT.Redacted<string>, body: any) =>
        api.createInteractionResponse(id, RDT.value(token), body),

      create: (id: string, token: RDT.Redacted<string>, body: any) =>
        api.createInteractionResponse(id, RDT.value(token), body),

      reply: (app: string, token: RDT.Redacted<string>, body: any) =>
        api.editOriginalInteractionResponse(app, RDT.value(token), body),

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
