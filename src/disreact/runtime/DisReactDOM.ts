import {Doken} from '#src/disreact/codec/rest/doken.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import {InteractionCallbackType} from 'dfx/types';

const layer = pipe(
  DiscordRESTMemoryLive,
  L.provide(NodeHttpClient.layerUndici),
  L.provide(
    L.effect(
      DiscordConfig.DiscordConfig,
      E.map(DisReactConfig, (config) => DiscordConfig.make({token: config.token})),
    ),
  ),
);

const service = E.map(DiscordREST, (api) => {
  const createModal = (doken: Doken, data: any) =>
    api.createInteractionResponse(
      doken.id,
      Doken.value(doken),
      {
        type: InteractionCallbackType.MODAL,
        data: data,
      },
    );

  const createSource = (doken: Doken, data: any) =>
    api.createInteractionResponse(
      doken.id,
      Doken.value(doken),
      {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: data,
      },
    );

  const createUpdate = (doken: Doken, data: any) =>
    api.createInteractionResponse(
      doken.id,
      Doken.value(doken),
      {
        type: InteractionCallbackType.UPDATE_MESSAGE,
        data: data,
      },
    );

  const deferSource = (doken: Doken, isEphemeral?: boolean) =>
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

  const deferUpdate = (doken: Doken) =>
    api.createInteractionResponse(
      doken.id,
      Doken.value(doken),
      {
        type: InteractionCallbackType.DEFERRED_UPDATE_MESSAGE,
      },
    );

  const deferEdit = (doken: Doken, body: any) =>
    api.editOriginalInteractionResponse(
      doken.app,
      Doken.value(doken),
      body,
    );

  const discard = (doken: Doken) =>
    api.createInteractionResponse(
      doken.id,
      Doken.value(doken),
      {
        type: InteractionCallbackType.UPDATE_MESSAGE,
      },
    );

  const dismount = (doken: Doken) =>
    api.deleteOriginalInteractionResponse(
      doken.app,
      Doken.value(doken),
    );

  return {
    createModal,
    createSource,
    createUpdate,
    deferSource,
    deferUpdate,
    discard,
    dismount,
    deferEdit,
  };
});

export class DisReactDOM extends E.Service<DisReactDOM>()('disreact/DisReactDOM', {
  accessors: true,
  effect   : service,
}) {

}
