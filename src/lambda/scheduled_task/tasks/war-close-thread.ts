import {DT, E, pipe, S} from '#src/internal/pure/effect.ts';
import {DiscordClan} from '#src/dynamo/discord-clan.ts';
import {DiscordServer} from '#src/dynamo/discord-server.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {ThreadId} from '#src/dynamo/common.ts';


export type TWarCloseThread = S.Schema.Type<typeof TaskWarCloseThread>;


export const TaskWarCloseThread = S.Struct({
    task: S.Literal('TaskWarCloseThread'),
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


const TaskWarCloseThreadEncode = S.encodeUnknown(TaskWarCloseThread);
export const TaskWarCloseThreadDecode = S.decodeUnknown(TaskWarCloseThread);


export const scheduleTaskWarCloseThread = (time: DT.Utc, event: TWarCloseThread) => pipe(
    TaskWarCloseThreadEncode(event),
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


export const taskWarCloseThread = (event: TWarCloseThread) => E.gen(function * () {
    const discord = yield * DiscordREST;

    const wars = yield * Clashofclans.getWars(event.data.clan.sk).pipe(E.catchAll(() => E.succeed([])));

    const apiWar = wars.find((w) => w.opponent.tag === event.data.opponent.tag);

    if (!apiWar) {
        return;
    }

    yield * discord.createMessage(event.data.clan.thread_prep, {
        content: `war ended in ${apiWar.status}`,
    });
    yield * discord.modifyChannel(event.data.thread, {
        name    : `🗂️│${event.data.clanName}│${apiWar.endTime.toDateString()}│${apiWar.status}`,
        archived: true,
        locked  : true,
    });
});
