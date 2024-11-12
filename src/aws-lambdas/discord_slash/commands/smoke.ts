import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/aws-lambdas/discord_menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/discord_slash/types.ts';
import {CSL, DT, E} from '#src/internals/re-exports/effect.ts';
import type {CmdIx} from '#src/internals/re-exports/discordjs.ts';
import {validateServer} from '#src/aws-lambdas/discord_slash/utils.ts';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {SQSService} from '@effect-aws/client-sqs';
import {OPTION_CLAN} from '#src/aws-lambdas/discord_slash/options.ts';
import {getDiscordClan} from '#src/dynamo/discord-clan.ts';
import {getAliasTag} from '#src/aws-lambdas/discord_menu/old/get-alias-tag.ts';
import {Discord, UI} from 'dfx';

export const SMOKE
    = {
        type       : ApplicationCommandType.ChatInput,
        name       : 'smoke',
        description: 'devs & inner circle ONLY!!!',
        options    : {
            ...OPTION_CLAN,
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /smoke]
 */
export const smoke = (data: CmdIx, options: CmdOps<typeof SMOKE>) => E.gen(function * () {
    yield * validateServer(data);

    const clanTag = getAliasTag(options.clan);

    const clan = yield * getDiscordClan({pk: data.guild_id!, sk: clanTag});

    return {
        embeds    : [{description: 'ya did the thing'}],
        components: UI.grid([
            [
                UI.button({
                    custom_id: `c-${clan.sk}`,
                    label    : 'try me!',
                }),
            ],
        ]),
    };
});
