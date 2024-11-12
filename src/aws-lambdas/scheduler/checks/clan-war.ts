import {type DClan, putDiscordClan} from '#src/database/discord-clan.ts';
import type {DServer} from '#src/database/discord-server.ts';
import {CSL, DT, E} from '#src/internals/re-exports/effect.ts';
import {ClashperkService} from '#src/internals/layers/clashperk-service.ts';
import type {ClanWar} from 'clashofclans.js';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';
import {ClanCache} from '#src/internals/layers/clan-cache.ts';
import {scheduleTaskWarBattleThread} from '#src/aws-lambdas/scheduled_task/tasks/war-battle-thread.ts';
import {scheduleTaskWarCloseThread} from '#src/aws-lambdas/scheduled_task/tasks/war-close-thread.ts';
import {updateWarCountdown} from '#src/aws-lambdas/scheduler/checks/update-war-countdowns.ts';

export const eachClan = (server: DServer, clan: DClan) => E.gen(function * () {
    const discord = yield * DiscordREST;

    const wars = yield * ClashperkService.getWars(clan.sk).pipe(E.catchAll(() => E.succeed([] as ClanWar[])));

    const cname = yield * updateWarCountdown(clan, wars);

    const prepWar = wars.find((w) => w.isPreparationDay);

    if (!prepWar) {
        return;
    }

    if (clan.prep_opponent === prepWar.opponent.tag) {
        return;
    }

    const group = yield * SchedulerService.getScheduleGroup({Name: `s-${clan.pk}-c-${clan.sk}`}).pipe(E.catchAll(() => E.succeed({Name: undefined})));

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

    const thread = yield * discord.startThreadInForumOrMediaChannel(server.forum!, {
        name   : `🛠️│${prepWar.clan.name}`,
        // @ts-expect-error dfx types need to be fixed
        message: {
            content: `${prepWar.clan.name} vs. ${prepWar.opponent.name}`,
        },
        auto_archive_duration: 1440,
    }).json;

    const clanCache = yield * yield * ClanCache;

    const updatedClan = yield * putDiscordClan({
        ...clan,
        prep_opponent: prepWar.opponent.tag,
        thread_prep  : thread.id,
    });

    yield * clanCache.set(`${updatedClan.pk}/${updatedClan.sk}`, updatedClan);

    yield * E.all([
        scheduleTaskWarBattleThread(yield * DT.make(prepWar.startTime), {
            task: 'WarBattleThread',
            data: {
                server,
                clan,
                clanName: cname,
                opponent: {
                    name: prepWar.clan.name,
                    tag : prepWar.clan.tag,
                },
                thread: thread.id,
            },
        }),
        scheduleTaskWarCloseThread(yield * DT.make(prepWar.endTime), {
            task: 'WarBattleThread',
            data: {
                server,
                clan,
                clanName: cname,
                opponent: {
                    name: prepWar.clan.name,
                    tag : prepWar.clan.tag,
                },
                thread: thread.id,
            },
        }),
    ]);
});
