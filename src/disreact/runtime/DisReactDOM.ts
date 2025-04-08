import {Doken} from '#src/disreact/codec/doken.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import {InteractionCallbackType} from 'dfx/types';
import {Redacted} from 'effect';

export class DisReactDOM extends E.Service<DisReactDOM>()('disreact/DisReactDOM', {
  effect: E.map(DiscordREST, (api) => {
    const createModal = (doken: Doken.Value, data: any) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        {
          type: InteractionCallbackType.MODAL,
          data: data,
        },
      );

    const createSource = (doken: Doken.Value, data: any) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: data,
        },
      );

    const createUpdate = (doken: Doken.Value, data: any) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        {
          type: InteractionCallbackType.UPDATE_MESSAGE,
          data: data,
        },
      );


    const deferSource = (doken: Doken.Value, isEphemeral?: boolean) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        {
          type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: isEphemeral ? 64 : 0,
          },
        },
      );

    const deferUpdate = (doken: Doken.Value) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        {
          type: InteractionCallbackType.DEFERRED_UPDATE_MESSAGE,
        },
      );

    const discard = (doken: Doken.Value) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        {
          type: InteractionCallbackType.UPDATE_MESSAGE,
        },
      );

    const dismount = (doken: Doken.Value) =>
      api.deleteOriginalInteractionResponse(
        doken.app,
        Doken.value(doken),
      );

    const defer = (doken: Doken.Value, body: any) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        body,
      );

    const create = (doken: Doken.Value, body: any) =>
      api.createInteractionResponse(
        doken.id,
        Doken.value(doken),
        body,
      );

    const reply = (doken: Doken.Value, body: any) =>
      api.editOriginalInteractionResponse(
        doken.app,
        Doken.value(doken),
        body,
      );

    return {
      createModal,
      createSource,
      createUpdate,
      deferSource,
      deferUpdate,
      discard,
      dismount,
      defer,
      create,
      reply,
    };
  }),

  dependencies: [
    pipe(
      DiscordRESTMemoryLive,
      L.provide(NodeHttpClient.layerUndici),
      L.provide(
        L.effect(
          DiscordConfig.DiscordConfig,
          E.map(DisReactConfig, (config) => DiscordConfig.make({token: config.token})),
        ),
      ),
    ),
  ],
}) {

}
