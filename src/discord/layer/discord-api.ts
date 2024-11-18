import {CFG, E, L, pipe} from '#src/internal/pure/effect.ts';
import type {DiscordRESTError} from 'dfx/DiscordREST';
import {DiscordREST} from 'dfx/DiscordREST';
import type {EA} from '#src/internal/types.ts';
import {Discord, DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {type IxR, type IxRE, type IxD, MGF} from '#src/discord/util/discord.ts';
import type {ResponseError} from '@effect/platform/HttpClientError';
import type {Message} from 'dfx/types';
import {NodeHttpClient} from '@effect/platform-node';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internal/constants/secrets.ts';


type Orig<T extends keyof typeof DiscordREST.Service> = Parameters<typeof DiscordREST.Service[T]>;
type DE<T> = E.Effect<T, DiscordRESTError | ResponseError>;


const api = E.gen(function * () {
    const discord = yield * DiscordREST;

    const executeWebhookJson = (...p: Orig<'executeWebhook'>) => discord.executeWebhook(p[0], p[1], p[2], {
        ...p[3],
        urlParams: {
            ...p[3]?.urlParams,
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
    L.provide(NodeHttpClient.layerUndici),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
);