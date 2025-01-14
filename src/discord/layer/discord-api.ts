import {TxFlag, TxType} from '#pure/dfx';
import {type IxD, type IxR, type IxRE, MGF} from '#src/internal/discord.ts';
import {E, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';
import {NodeHttpClient} from '@effect/platform-node';
import type {ResponseError} from '@effect/platform/HttpClientError';
import {Discord, DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import type {DiscordRESTError} from 'dfx/DiscordREST';
import {DiscordREST} from 'dfx/DiscordREST';
import type {Message} from 'dfx/types';


type Orig<T extends keyof typeof DiscordREST.Service> = Parameters<typeof DiscordREST.Service[T]>;
type DE<T> = E.Effect<T, DiscordRESTError | ResponseError>;


const api = E.gen(function * () {
  const discord = yield * DiscordREST;

  return {
    ...discord,

    executeWebhookJson: (...p: Orig<'executeWebhook'>) => discord.executeWebhook(p[0], p[1], p[2], {
      ...p[3],
      urlParams: {
        ...p[3]?.urlParams,
        wait: true,
      },
    }).json as DE<Message>,

    deferEntry: (ix: IxD) => discord.createInteractionResponse(ix.id, ix.token, {
      type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    }),

    deferEntryEphemeral: (ix: IxD) => discord.createInteractionResponse(ix.id, ix.token, {
      type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: TxFlag.EPHEMERAL,
      },
    }),

    deferUpdate: (ix: IxD) => discord.createInteractionResponse(ix.id, ix.token, {
      type: TxType.DEFERRED_UPDATE_MESSAGE,
    }),

    openDialog: (ix: IxD, res: Discord.InteractionCallbackModal) => discord.createInteractionResponse(ix.id, ix.token, {
      type: TxType.MODAL,
      data: res,
    }),

    deleteMenu: (ix: IxD) => discord.deleteOriginalInteractionResponse(ix.application_id, ix.token),

    entryMenu: (ix: IxD, res: IxR['data']) => discord.createInteractionResponse(ix.id, ix.token, {
      type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: MGF.EPHEMERAL,
        ...res,
      },
    }),

    editMenu: (ix: IxD, res: Partial<IxRE>) => discord.editOriginalInteractionResponse(ix.application_id, ix.token, res),
  };
});


export class DiscordApi extends E.Tag('DeepFryerDiscord')<
  DiscordApi,
  EA<typeof api>
>() {
  static Live = L.effect(this, api);
}


export const DiscordLayerLive = pipe(
  DiscordApi.Live,
  L.provideMerge(DiscordRESTMemoryLive),
  L.provideMerge(NodeHttpClient.layerUndici),
  L.provideMerge(DiscordConfig.layer({token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN)})),
);
