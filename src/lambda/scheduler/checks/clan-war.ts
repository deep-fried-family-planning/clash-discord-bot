import {type DClan, putDiscordClan} from '#src/dynamo/discord-clan.ts';
import type {DServer} from '#src/dynamo/discord-server.ts';
import {CSL, DT, E, pipe} from '#src/internal/pure/effect.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';
import {ClanCache} from '#src/dynamo/cache/clan-cache.ts';
import {scheduleTaskWarBattleThread} from '#src/lambda/scheduled_task/tasks/war-battle-thread.ts';
import {scheduleTaskWarCloseThread} from '#src/lambda/scheduled_task/tasks/war-close-thread.ts';
import {updateWarCountdown} from '#src/lambda/scheduler/checks/update-war-countdowns.ts';


export const eachClan = (server: DServer, clan: DClan) => E.gen(function * () {
    const discord = yield * DiscordREST;

    const wars = yield * pipe(
        Clashofclans.getWars(clan.sk),
        E.catchAll(() => Clashofclans.getCurrentWar(clan.sk).pipe(
            E.map((w) => w ? [w] : []),
            E.catchAll(() => E.succeed([])),
        )),
    );

    const cname = yield * updateWarCountdown(clan, wars);

    const prepWar = wars.find((w) => w.isPreparationDay);

    if (!prepWar) {
        return;
    }

    if (clan.prep_opponent === prepWar.opponent.tag) {
        return;
    }

    const group = yield * pipe(
        Scheduler.getScheduleGroup({Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`}),
        E.catchTag('ResourceNotFoundException', () => E.succeed({Name: undefined})),
    );

    yield * CSL.log('new schedule group', group);

    if (!group.Name) {
        const newgroup = yield * Scheduler.createScheduleGroup({
            Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`,
        });
        yield * CSL.log('new schedule group', newgroup.ScheduleGroupArn);
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

    const updatedClan = yield * putDiscordClan({
        ...clan,
        prep_opponent: prepWar.opponent.tag,
        thread_prep  : thread.id,
    });

    yield * ClanCache.set(`${updatedClan.pk}/${updatedClan.sk}`, updatedClan);

    yield * E.all([
        scheduleTaskWarBattleThread(yield * DT.make(prepWar.startTime), {
            task: 'TaskWarBattleThread',
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
            task: 'TaskWarCloseThread',
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
