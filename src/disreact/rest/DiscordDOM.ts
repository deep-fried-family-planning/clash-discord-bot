import {DiscordRESTEnv} from '#config/external.ts';
import * as Doken from '#src/disreact/adaptor/codec/doken.ts';
import {NodeHttpClient} from '@effect/platform-node';
import type {HttpClientError} from '@effect/platform/HttpClientError';
import {Discord, DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

export type DiscordDOMService = {
  createModal : (doken: Doken.Doken, data: any) => E.Effect<Discord.InteractionCallbackResponse, HttpClientError>;
  createSource: (doken: Doken.Doken, data: any) => E.Effect<Discord.InteractionCallbackResponse, HttpClientError>;
  createUpdate: (doken: Doken.Doken, data: any) => E.Effect<Discord.InteractionCallbackResponse, HttpClientError>;
  deferSource : (doken: Doken.Doken, isEphemeral?: boolean) => E.Effect<Discord.InteractionCallbackResponse, HttpClientError>;
  deferUpdate : (doken: Doken.Doken) => E.Effect<Discord.InteractionCallbackResponse, HttpClientError>;
  deferEdit   : (doken: Doken.Doken, body: any) => E.Effect<Discord.MessageResponse, HttpClientError>;
  discard     : (doken: Doken.Doken) => E.Effect<Discord.InteractionCallbackResponse, HttpClientError>;
  dismount    : (doken: Doken.Doken) => E.Effect<void, HttpClientError>;
};

export class DiscordDOM extends E.Service<DiscordDOM>()('disreact/DisReactDOM', {
  effect: E.gen(function* () {
    const api = yield* DiscordREST;

    return {
      createModal: (doken: Doken.Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Doken.value(doken),
          {
            payload: {
              type: Discord.InteractionCallbackTypes.MODAL,
              data: data,
            },
          },
        ),
      createSource: (doken: Doken.Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Doken.value(doken),
          {
            payload: {
              type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
              data: data,
            },
          },
        ),
      createUpdate: (doken: Doken.Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Doken.value(doken),
          {
            payload: {
              type: Discord.InteractionCallbackTypes.UPDATE_MESSAGE,
              data: data,
            },
          },
        ),
      deferSource: (doken: Doken.Doken, isEphemeral?: boolean) =>
        api.createInteractionResponse(
          doken.id,
          Doken.value(doken),
          {
            payload: {
              type: Discord.InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: isEphemeral ? 64 : 0,
              },
            },
          },
        ),
      deferUpdate: (doken: Doken.Doken) =>
        api.createInteractionResponse(
          doken.id,
          Doken.value(doken),
          {
            payload: {
              type: Discord.InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE,
            },
          },
        ),
      deferEdit: (doken: Doken.Doken, body: any) =>
        api.updateOriginalWebhookMessage(
          doken.app,
          Doken.value(doken),
          {
            payload: body,
          },
        ),
      discard: (doken: Doken.Doken) =>
        api.createInteractionResponse(
          doken.id,
          Doken.value(doken),
          {
            payload: {
              type: Discord.InteractionCallbackTypes.UPDATE_MESSAGE,
            },
          },
        ),
      dismount: (doken: Doken.Doken) =>
        api.deleteOriginalWebhookMessage(
          doken.app,
          Doken.value(doken),
        ),
    };
  }),
  dependencies: [
    DiscordRESTMemoryLive.pipe(
      L.provideMerge(NodeHttpClient.layerUndici),
      L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ],
  accessors: true,
}) {}

export class DiscordJsDisReactDOM extends E.Service<DiscordDOMService>()('disreact/DisReactDOM', {
  effect: E.sync(() => {
    return {} as DiscordDOM;
  }),
  accessors: true,
}) {}
