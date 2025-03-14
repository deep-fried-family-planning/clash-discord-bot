
import {DsxSettings} from '#src/disreact/external/DisReactConfig.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import type {Tx} from '#src/disreact/codec/wire/index.ts';



export class InteractionDOM extends E.Service<InteractionDOM>()('disreact/InteractionDOM', {
  accessors: true,

  effect: E.gen(function* () {
    const api    = yield* DiscordREST;
    const config = yield* DsxSettings;

    // const discard  = (tx: Tx.Discard) => api.createInteractionResponse(tx.id, tx.token, tx.body);
    // const defer    = (tx: Tx.Defer) => api.createInteractionResponse(tx.id, tx.token, tx.body);
    // const create   = (tx: Tx.Create) => api.createInteractionResponse(tx.id, tx.token, tx.body as any);
    // const reply    = (tx: Tx.Reply) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any);
    // const update   = (tx: Tx.Update) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any);
    // const dismount = (tx: Tx.Dismount) => api.deleteOriginalInteractionResponse(tx.app, tx.token);

    return {
      discard : (tx: Tx.Discard) => api.createInteractionResponse(tx.id, tx.token, tx.body),
      defer   : (tx: Tx.Defer) => api.createInteractionResponse(tx.id, tx.token, tx.body),
      create  : (tx: Tx.Create) => api.createInteractionResponse(tx.id, tx.token, tx.body as any),
      reply   : (tx: Tx.Reply) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any),
      update  : (tx: Tx.Update) => api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any),
      dismount: (tx: Tx.Dismount) => api.deleteOriginalInteractionResponse(tx.app, tx.token),
    };
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
