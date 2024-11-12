import type {CommandSpec, Interaction} from '#src/aws-lambdas/discord_menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {putDiscordClan} from '#src/database/discord-clan.ts';
import {getAliasTag} from '#src/aws-lambdas/discord_menu/old/get-alias-tag.ts';
import {ClashperkService} from '#src/internals/layers/clashperk-service.ts';
import {CMDT, CMDOPT} from '#src/internals/re-exports/discordjs.ts';
import {replyError, SlashUserError} from '#src/internals/errors/slash-error.ts';
import {validateServer} from '#src/aws-lambdas/slash/utils.ts';
import {OPTION_CLAN} from '#src/aws-lambdas/slash/options.ts';

export const CLAN_FAM
    = {
        type       : CMDT.ChatInput,
        name       : 'clanfam',
        description: 'link clan to your discord server in deepfryer',
        options    : {
            ...OPTION_CLAN,
            countdown: {
                type       : CMDOPT.Channel,
                name       : 'countdown',
                description: 'oomgaboomga',
                required   : true,
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /clanfam]
 */
export const clanfam = (data: Interaction, options: CmdOps<typeof CLAN_FAM>) => E.gen(function * () {
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

    const clash = yield * ClashperkService;
    const clanTag = getAliasTag(options.clan);
    const clan
        = yield * clash.getClan(clanTag)
            .pipe(replyError('Provided clan tag does not exist.'));

    yield * putDiscordClan({
        pk             : data.guild_id!,
        sk             : clan.tag,
        type           : 'DiscordClan',
        version        : '1.0.0',
        created        : new Date(Date.now()),
        updated        : new Date(Date.now()),
        gsi_server_id  : data.guild_id!,
        gsi_clan_tag   : clanTag,
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
