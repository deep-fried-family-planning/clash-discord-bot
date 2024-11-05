import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import type {ROptions} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/utils/effect.ts';
import {putDiscordClan} from '#src/database/discord-clan.ts';
import {OPTION_CLAN} from '#src/discord/commands-options.ts';
import {getAliasTag} from '#src/discord/command-util/get-alias-tag.ts';

export const CLAN_FAM
    = {
        type       : ApplicationCommandType.ChatInput,
        name       : 'clanfam',
        description: 'link clan to your discord server in deepfryer',
        options    : {
            clan     : OPTION_CLAN,
            countdown: {
                type       : ApplicationCommandOptionType.String,
                name       : 'countdown',
                description: 'oomgaboomga',
                required   : true,
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /clanfam]
 */
export const clanfam = (data: Interaction, options: ROptions<typeof CLAN_FAM>) => E.gen(function * () {
    // validations
    // - is this even a clan tag?
    // - does the clan exist?
    // - server registered?
    // - server admin role?
    // - discord user linked to clan (co)leader in game?
    // - is this literally the same link?
    // - clan linked somewhere else? 1:1 relationship

    const clan = getAliasTag(options.clan);

    yield * putDiscordClan({
        pk             : `server-${data.guild_id}`,
        sk             : `clan-${clan}`,
        type           : 'DiscordClan',
        version        : '1.0.0',
        created        : new Date(Date.now()),
        updated        : new Date(Date.now()),
        gsi_server_id  : `server-${data.guild_id}`,
        gsi_clan_tag   : `clan-${clan}`,
        thread_prep    : '',
        prep_opponent  : '',
        thread_battle  : '',
        battle_opponent: '',
        countdown      : options.countdown,
    });

    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
