import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import type {ROptions} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {putDiscordClan} from '#src/database/discord-clan.ts';
import {OPTION_CLAN} from '#src/discord/commands-options.ts';
import {getAliasTag} from '#src/discord/command-util/get-alias-tag.ts';
import {ClashService} from '#src/internals/layers/clash-service.ts';
import {CMDT, OPT} from '#src/internals/re-exports/discordjs.ts';
import {replyError, SlashUserError} from '#src/internals/errors/slash-error.ts';
import {validateServer} from '#src/aws-lambdas/slash/validation-utils.ts';

export const CLAN_FAM
    = {
        type       : CMDT.ChatInput,
        name       : 'clanfam',
        description: 'link clan to your discord server in deepfryer',
        options    : {
            clan     : OPTION_CLAN,
            countdown: {
                type       : OPT.Channel,
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
    const [server, user] = yield * validateServer(data);

    // validations
    // - is this even a clan tag?
    // - does the clan exist?
    // - server registered?
    // - server admin role?
    // - discord user linked to clan (co)leader in game?
    // - is this literally the same link?
    // - clan linked somewhere else? 1:1 relationship

    if (!user.roles.includes(server.admin)) {
        return yield * new SlashUserError({issue: 'admin role required'});
    }

    const clash = yield * ClashService;
    const clanTag = getAliasTag(options.clan);
    const clan
        = yield * clash.getClan(clanTag)
            .pipe(replyError('Provided clan tag does not exist.'));

    yield * putDiscordClan({
        pk             : `server-${data.guild_id}`,
        sk             : `clan-${clan.tag}`,
        type           : 'DiscordClan',
        version        : '1.0.0',
        created        : new Date(Date.now()),
        updated        : new Date(Date.now()),
        gsi_server_id  : `server-${data.guild_id}`,
        gsi_clan_tag   : `clan-${clanTag}`,
        thread_prep    : '',
        prep_opponent  : 'clan-',
        thread_battle  : '',
        battle_opponent: 'clan-',
        countdown      : options.countdown,
    });

    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
