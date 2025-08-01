import {DiscordRESTEnv} from '#config/external.ts';
import type * as Doken from '#disreact/adaptor-discord/internal/Doken.ts';
import * as NodeHttpClient from '@effect/platform-node/NodeHttpClient';
import type * as HttpClientError from '@effect/platform/HttpClientError';
import {Discord, DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import type {DiscordRestError, ErrorResponse, RatelimitedResponse} from 'dfx/DiscordREST/Generated';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

export class DiscordDOMError extends Data.TaggedError('DiscordDOMError')<{
  cause: | HttpClientError.HttpClientError
         | DiscordRestError<'RatelimitedResponse', RatelimitedResponse>
         | DiscordRestError<'ErrorResponse', ErrorResponse>;
}>
{}

export interface DiscordDOMService {
  createModal : (doken: Doken.Exposed, data: any) => Effect.Effect<Discord.InteractionCallbackResponse, DiscordDOMError>;
  createSource: (doken: Doken.Exposed, data: any) => Effect.Effect<Discord.InteractionCallbackResponse, DiscordDOMError>;
  createUpdate: (doken: Doken.Exposed, data: any) => Effect.Effect<Discord.InteractionCallbackResponse, DiscordDOMError>;
  deferSource : (doken: Doken.Exposed, isEphemeral?: boolean) => Effect.Effect<Discord.InteractionCallbackResponse, DiscordDOMError>;
  deferUpdate : (doken: Doken.Exposed) => Effect.Effect<Discord.InteractionCallbackResponse, DiscordDOMError>;
  deferEdit   : (doken: Doken.Exposed, body: any) => Effect.Effect<Discord.MessageResponse, DiscordDOMError>;
  discard     : (doken: Doken.Exposed) => Effect.Effect<Discord.InteractionCallbackResponse, DiscordDOMError>;
  dismount    : (doken: Doken.Exposed) => Effect.Effect<void, DiscordDOMError>;
};

export class DiscordDOM extends Effect.Service<DiscordDOM>()('disreact/DisReactDOM', {
  effect: Effect.gen(function* () {
    const api = yield* DiscordREST;

    return {


      createModal: (doken: Doken.Exposed, data: any) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.MODAL,
              data: data,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      createSource: (doken: Doken.Exposed, data: any) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
              data: data,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      createUpdate: (doken: Doken.Exposed, data: any) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.UPDATE_MESSAGE,
              data: data,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      deferSource: (doken: Doken.Exposed, isEphemeral?: boolean) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: isEphemeral ? 64 : 0,
              },
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      deferUpdate: (doken: Doken.Exposed) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      deferEdit: (doken: Doken.Exposed, body: any) =>
        api.updateOriginalWebhookMessage(
          doken.appId,
          doken.value,
          {
            payload: body,
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      discard: (doken: Doken.Exposed) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.UPDATE_MESSAGE,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      dismount: (doken: Doken.Exposed) =>
        api.deleteOriginalWebhookMessage(
          doken.appId,
          doken.value,
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),
    } as DiscordDOMService;
  }),
  dependencies: [
    DiscordRESTMemoryLive.pipe(
      Layer.provideMerge(NodeHttpClient.layerUndici),
      Layer.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ],
  accessors: true,
})
{}

export class DisReactDOM extends Effect.Service<DisReactDOM>()('disreact/DisReactDOM', {
  effect: Effect.gen(function* () {
    const api = yield* DiscordREST;

    return {


      modal: (doken: Doken.Exposed, data: any) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.MODAL,
              data: data,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      source: (doken: Doken.Exposed, data: any) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
              data: data,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      createUpdate: (doken: Doken.Exposed, data: any) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.UPDATE_MESSAGE,
              data: data,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      deferSource: (doken: Doken.Exposed, isEphemeral?: boolean) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: isEphemeral ? 64 : 0,
              },
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      deferUpdate: (doken: Doken.Exposed) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      deferEdit: (doken: Doken.Exposed, body: any) =>
        api.updateOriginalWebhookMessage(
          doken.appId,
          doken.value,
          {
            payload: body,
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      discard: (doken: Doken.Exposed) =>
        api.createInteractionResponse(
          doken.id,
          doken.value,
          {
            payload: {
              type: Discord.InteractionCallbackTypes.UPDATE_MESSAGE,
            },
          },
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),

      dismount: (doken: Doken.Exposed) =>
        api.deleteOriginalWebhookMessage(
          doken.appId,
          doken.value,
        ).pipe(Effect.catchAll((cause) => new DiscordDOMError({cause}))),
    };
  }),
  dependencies: [
    DiscordRESTMemoryLive.pipe(
      Layer.provideMerge(NodeHttpClient.layerUndici),
      Layer.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ],
  accessors: true,
})
{}
