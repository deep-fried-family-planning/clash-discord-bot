import {Doken} from '#src/disreact/codec/rest/doken.ts';
import {DiscordREST} from 'dfx';
import {InteractionCallbackTypes} from 'dfx/types';
import * as Effect from 'effect/Effect';
import * as Redacted from 'effect/Redacted';

export class DiscordDOM extends Effect.Service<DiscordDOM>()('disreact/DisReactDOM', {
  effect: Effect.gen(function* () {
    const api = yield* DiscordREST;

    return {
      createModal: (doken: Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            payload: {
              type: InteractionCallbackTypes.MODAL,
              data: data,
            },
          },
        ),
      createSource: (doken: Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            payload: {
              type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
              data: data,
            },
          },
        ),
      createUpdate: (doken: Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            payload: {
              type: InteractionCallbackTypes.UPDATE_MESSAGE,
              data: data,
            },
          },
        ),
      deferSource: (doken: Doken, isEphemeral?: boolean) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            payload: {
              type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: isEphemeral ? 64 : 0,
              },
            },
          },
        ),
      deferUpdate: (doken: Doken) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            payload: {
              type: InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE,
            },
          },
        ),
      deferEdit: (doken: Doken, body: any) =>
        api.updateOriginalWebhookMessage(
          doken.app,
          Redacted.value(doken.val),
          {
            payload: body,
          },
        ),
      discard: (doken: Doken) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            payload: {
              type: InteractionCallbackTypes.UPDATE_MESSAGE,
            },
          },
        ),
      dismount: (doken: Doken) =>
        api.deleteOriginalWebhookMessage(
          doken.app,
          Doken.value(doken),
        ),
    };
  }),
  accessors: true,
}) {}

export class DiscordJsDisReactDOM extends Effect.Service<DiscordDOM>()('disreact/DisReactDOM', {
  effect: Effect.sync(() => {
    return {} as DiscordDOM;
  }),
  accessors: true,
}) {}
