import {DT, E, pipe, S} from '#src/internal/pure/effect.ts';
import {DiscordClan} from '#src/dynamo/discord-clan.ts';
import {DiscordServer} from '#src/dynamo/discord-server.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';
import {ThreadId} from '#src/dynamo/common.ts';


export type TWarBattleThread = S.Schema.Type<typeof TaskWarBattleThread>;


export const TaskWarBattleThread = S.Struct({
    task: S.Literal('TaskWarBattleThread'),
    data: S.Struct({
        server  : DiscordServer,
        clan    : DiscordClan,
        clanName: S.String,
        opponent: S.Struct({
            name: S.String,
            tag : S.String,
        }),
        thread: ThreadId,
    }),
});


const TaskWarBattleThreadEncode = S.encodeUnknown(TaskWarBattleThread);
export const TaskWarBattleThreadDecode = S.decodeUnknown(TaskWarBattleThread);


export const scheduleTaskWarBattleThread = (time: DT.Utc, event: TWarBattleThread) => pipe(
    TaskWarBattleThreadEncode(event),
    E.flatMap((encoded) => Scheduler.createSchedule({
        GroupName            : `s-${event.data.clan.pk}-c-${event.data.clan.sk.replace('#', '')}`,
        FlexibleTimeWindow   : {Mode: 'OFF'},
        ActionAfterCompletion: 'DELETE',
        Name                 : `${encoded.task}-${encoded.data.opponent.tag.replace('#', '')}`,
        ScheduleExpression   : `at(${DT.formatIso(time).replace(/\..+Z/, '')})`,
        Target               : {
            Arn    : process.env.SQS_ARN_SCHEDULED_TASK,
            RoleArn: process.env.LAMBDA_ROLE_ARN,
            Input  : JSON.stringify(encoded),
        },
    })),
);


export const taskWarBattleThread = (event: TWarBattleThread) => E.gen(function * () {
    const discord = yield * DiscordREST;
    yield * discord.modifyChannel(event.data.thread, {
        name: `🗡│${event.data.clanName}`,
    }, {});
    yield * discord.createMessage(event.data.thread, {
        content: 'war started',
    });
});
