import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/aws-lambdas/discord_menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/discord_slash/types.ts';
import {CSL, DT, E} from '#src/internals/re-exports/effect.ts';
import type {CmdIx} from '#src/internals/re-exports/discordjs.ts';
import {validateServer} from '#src/aws-lambdas/discord_slash/utils.ts';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {SQSService} from '@effect-aws/client-sqs';
import {OPTION_CLAN} from '#src/aws-lambdas/discord_slash/options.ts';
import {getDiscordClan} from '#src/database/discord-clan.ts';
import {getAliasTag} from '#src/aws-lambdas/discord_menu/old/get-alias-tag.ts';

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

    const group = yield * SchedulerService.getScheduleGroup({Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`}).pipe(E.catchAll(() => E.succeed({Name: undefined})));

    yield * CSL.log(group);

    if (!group.Name) {
        const newgroup = yield * SchedulerService.createScheduleGroup({
            Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`,
        });
        yield * CSL.log(newgroup.ScheduleGroupArn);
    }

    // events
    // immediate - create a war prep thread
    // immediate - thread message for war managers
    // 12 hrs - war manager reminder
    // 24 hrs - change war prep -> battle day thread
    // 24 hrs - do ur hits
    // 30 hrs - eval war
    // 36 hrs - do ur hits
    // 36 hrs - eval war
    // 42 hrs - eval war
    // 46 hrs - srsly do ur hits
    // 48 hrs - close battle day thread + results

    yield * SQSService.sendMessage({
        QueueUrl   : process.env.SQS_URL_SCHEDULED_TASK,
        MessageBody: JSON.stringify({
            name: 'hello world instant',
        }),
    });

    const zoned = yield * DT.nowInCurrentZone;

    const now = DT.addDuration('1 minutes')(zoned);

    yield * SchedulerService.createSchedule({
        GroupName            : `s-${clan.pk}-c-${clan.sk.replace('#', '')}`,
        FlexibleTimeWindow   : {Mode: 'OFF'},
        ActionAfterCompletion: 'DELETE',
        Name                 : Date.now().toString(),
        ScheduleExpression   : `at(${DT.formatIso(now).replace(/\..+Z/, '')})`,
        Target               : {
            Arn    : process.env.SQS_ARN_SCHEDULED_TASK,
            RoleArn: process.env.LAMBDA_ROLE_ARN,
            Input  : JSON.stringify({
                name: 'hello world scheduled',
            }),
        },
    });

    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
