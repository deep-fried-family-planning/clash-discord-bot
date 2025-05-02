import {Doken} from '#src/disreact/codec/rest/doken.ts';
import {DiscordREST} from 'dfx';
import {InteractionCallbackType} from 'dfx/types';
import {Effect, Redacted} from 'effect';

export class DisReactDOM extends Effect.Service<DisReactDOM>()('disreact/DisReactDOM', {
  effect: Effect.gen(function* () {
    const api = yield* DiscordREST;

    return {
      createModal: (doken: Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            type: InteractionCallbackType.MODAL,
            data: data,
          },
        ),
      createSource: (doken: Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: data,
          },
        ),
      createUpdate: (doken: Doken, data: any) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            type: InteractionCallbackType.UPDATE_MESSAGE,
            data: data,
          },
        ),
      deferSource: (doken: Doken, isEphemeral?: boolean) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: isEphemeral ? 64 : 0,
            },
          },
        ),
      deferUpdate: (doken: Doken) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            type: InteractionCallbackType.DEFERRED_UPDATE_MESSAGE,
          },
        ),
      deferEdit: (doken: Doken, body: any) =>
        api.editOriginalInteractionResponse(
          doken.app,
          Redacted.value(doken.val),
          body,
        ),
      discard: (doken: Doken) =>
        api.createInteractionResponse(
          doken.id,
          Redacted.value(doken.val),
          {
            type: InteractionCallbackType.UPDATE_MESSAGE,
          },
        ),
      dismount: (doken: Doken) =>
        api.deleteOriginalInteractionResponse(
          doken.app,
          Doken.value(doken),
        ),
    };
  }),
  accessors: true,
}) {}

export class DiscordJsDisReactDOM extends Effect.Service<DisReactDOM>()('disreact/DisReactDOM', {
  effect: Effect.sync(() => {
    return {} as DisReactDOM;
  }),
  accessors: true,
}) {}
