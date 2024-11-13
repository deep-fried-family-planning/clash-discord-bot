import {E, L} from '#src/internals/re-exports/effect.ts';
import {DiscordREST} from 'dfx/DiscordREST';
import type {EA} from '#src/internals/types.ts';
import {Discord} from 'dfx';
import {MSG} from '#src/aws-lambdas/discord_menu/old/re-exports.ts';
import type {IxRes} from '#src/internals/re-exports/discordjs.ts';
import type {CompIx} from '#src/internals/re-exports/discordjs.ts';
import type {InteractionResponse} from 'dfx/types';

type Orig<T extends keyof typeof DiscordREST.Service> = Parameters<typeof DiscordREST.Service[T]>;

const api = E.gen(function * () {
    const discord = yield * DiscordREST;

    return {
        ...discord,

        entryMenu: (ix: CompIx, res: IxRes['data']) => discord.createInteractionResponse(ix.id, ix.token, {
            type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: MSG.Ephemeral,
                ...res,
            },
        }).json,

        entryModal: (...p: Orig<'createInteractionResponse'>) => discord.createInteractionResponse(p[0], p[1], {
            ...p[2],
            type: Discord.InteractionCallbackType.MODAL,
        }, p[3]).json,

        editMenu: (...p: Orig<'editOriginalInteractionResponse'>) => discord.editOriginalInteractionResponse(p[0], p[1], {
            ...p[2],
        }, p[3]).json,
    };
});

export class DiscordApi extends E.Tag('DeepFryerDiscord')<
    DiscordApi,
    EA<typeof api>
>() {
    static Live = L.effect(this, api);
}
