import {type DClan, putDiscordClan} from '#src/dynamo/schema/discord-clan.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';
import {ClanCache} from '#src/dynamo/cache/clan-cache.ts';
import {updateWarCountdown} from '#src/poll/update-war-countdowns.ts';
import {WarBattle00hr} from '#src/task/war-thread/war-battle-00hr.ts';
import {WarBattle24Hr} from '#src/task/war-thread/war-battle-24hr.ts';
import {WarPrep24hr} from '#src/task/war-thread/war-prep-24hr.ts';


export const eachClan = (server: DServer, clan: DClan) => E.gen(function * () {
    const discord = yield * DiscordREST;

    const wars = yield * pipe(
        ClashOfClans.getWars(clan.sk),
        E.catchAll(() => ClashOfClans.getCurrentWar(clan.sk).pipe(
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
        WarPrep24hr.send(prepWar.preparationStartTime, '0 hour', server, clan, prepWar, thread),
        WarBattle24Hr.send(prepWar.startTime, '0 hour', server, clan, prepWar, thread),
        WarBattle00hr.send(prepWar.startTime, '24 hour', server, clan, prepWar, thread),
    ]);
});
