import {type DClan, putDiscordClan} from '#src/database/discord-clan.ts';
import type {DServer} from '#src/database/discord-server.ts';
import {CSL, E, pipe} from '#src/internals/re-exports/effect.ts';
import {ClashperkService} from '#src/internals/layers/clashperk-service.ts';
import {mapL} from '#src/pure/pure-list.ts';
import type {ClanWar} from 'clashofclans.js';
import {EventBridgeService} from '@effect-aws/client-eventbridge';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {Console} from 'effect';
import {SQSService} from '@effect-aws/client-sqs';

// todos
// 1. check for war prep clan tag change
// 2. update war countdowns

const clanWar = (server: DServer, clans: DClan[]) => E.gen(function * () {
    clans.map();

    pipe(
        clans,
        mapL((c) => E.gen(function * () {

        })),
    );
});

const eachClan = (clan: DClan) => E.gen(function * () {
    const wars = yield * ClashperkService.getWars(clan.sk).pipe(E.catchAll(() => E.succeed([] as ClanWar[])));

    const prepWar = wars.find((w) => w.isPreparationDay);

    if (!prepWar) {
        return;
    }

    if (clan.prep_opponent === prepWar.opponent.tag) {
        return;
    }

    const group = yield * SchedulerService.getScheduleGroup({Name: `s-${clan.pk}-c-${clan.sk}`});

    yield * CSL.log(group);

    if (!group.Name) {
        const newgroup = yield * SchedulerService.createScheduleGroup({
            Name: `s-${clan.pk}-c-${clan.sk}`,
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
        QueueUrl   : process.env.SQS_SCHEDULED_TASK,
        MessageBody: JSON.stringify({}),
    });

    SchedulerService.createSchedule({
        GroupName            : `s-${clan.pk}-c-${clan.sk}`,
        FlexibleTimeWindow   : {Mode: 'OFF'},
        ActionAfterCompletion: 'DELETE',
        Name                 : undefined,
        ScheduleExpression   : `at()`,
        Target               : {
            Arn    : '',
            RoleArn: '',
            Input  : JSON.stringify({}),
        },
    });
});
