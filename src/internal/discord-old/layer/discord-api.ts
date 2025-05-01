import {DiscordEnv} from '#config/external.ts';
import {type IxD, type IxR, type IxRE, MGF} from '#src/internal/discord-old/discord.ts';
import {E, L, pipe, RDT} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {Discord, DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import type {DiscordRESTError} from 'dfx/DiscordREST';
import {DiscordREST} from 'dfx/DiscordREST';
import type {Message} from 'dfx/types';

type Orig<T extends keyof typeof DiscordREST.Service> = Parameters<typeof DiscordREST.Service[T]>;
type DE<T> = E.Effect<T, DiscordRESTError>;

const api = E.gen(function* () {
  const discord = yield* DiscordREST;

  const executeWebhookJson = (...p: Orig<'executeWebhook'>) => discord.executeWebhook(p[0], p[1], p[2], {
    ...p[3],
    urlParams: {
      wait: true,
    },
  }).json as DE<Message>;

  return {
    ...discord,
    executeWebhookJson,

    entryMenu: (ix: IxD, res: IxR['data']) => discord.createInteractionResponse(ix.id, ix.token, {
      type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: MGF.EPHEMERAL,
        ...res,
      },
    }).json,

    editMenu: (ix: IxD, res: Partial<IxRE>) => discord.editOriginalInteractionResponse(ix.application_id, ix.token, res).json,
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
  L.provide(NodeHttpClient.layer),
  L.provideMerge(
    L.unwrapEffect(
      E.map(DiscordEnv, (env) =>
        DiscordConfig.layer({
          token: env.DFFP_DISCORD_BOT_TOKEN,
        }),
      ),
    ),
  ),
);
