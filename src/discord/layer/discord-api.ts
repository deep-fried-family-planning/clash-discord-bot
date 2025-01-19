import type {IxD, IxRE} from '#src/internal/discord.ts';
import type {DA, Df} from '#src/internal/disreact/model/entities/index.ts';
import {E, L, pipe, RDT} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
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

    ixDefer: (id: str, token: str, df: Exclude<Df.T, Df.None | Df.Close>) => discord.createInteractionResponse(
      id,
      token,
      df.rest,
    ),
    ixEdit: (app_id: str, token: str, res: DA.TxMessage) => discord.editOriginalInteractionResponse(
      app_id,
      token,
      res as Partial<IxRE>,
    ),
    ixDelete: (app_id: str, token: str) => discord.deleteOriginalInteractionResponse(
      app_id,
      token,
    ),
    ixDirect: (id: str, token: str, res: DA.TxMessage) => discord.createInteractionResponse(
      id,
      token,
      res as Discord.InteractionResponse,
    ),
    ixDialog: (id: str, token: str, res: Discord.InteractionCallbackModal) => discord.createInteractionResponse(
      id,
      token,
      {
        type: Discord.InteractionCallbackType.MODAL,
        data: res,
      },
    ),

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
  L.provide(DiscordRESTMemoryLive),
  L.provide(NodeHttpClient.layerUndici),
  L.provide(DiscordConfig.layer({token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN)})),
);
