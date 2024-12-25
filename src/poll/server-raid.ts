import {ServerCache} from '#src/dynamo/cache/server-cache.ts';
import {encodeServerId} from '#src/dynamo/schema/common-encoding.ts';
import {type DServer, putDiscordServer} from '#src/dynamo/schema/discord-server.ts';
import {Cron, E, g, pipe} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure';
import {SetInviteOnly} from '#src/task/raid-thread/set-invite-only.ts';
import {SetOpen} from '#src/task/raid-thread/set-open.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx/DiscordREST';


const raidWeekendDone = Cron.make({
    days    : [],
    hours   : [],
    minutes : [],
    months  : [],
    weekdays: [1, 2, 3],
});


export const serverRaid = (server: DServer) => g(function * () {
    const discord = yield * DiscordREST;

    if (server.raids) {
        return;
    }

    const server_id = yield * encodeServerId(server.pk);

    const group = yield * pipe(
        Scheduler.getScheduleGroup({Name: server_id}),
        E.catchTag('ResourceNotFoundException', () => E.succeed({Name: undefined})),
    );

    if (!group.Name) {
        yield * Scheduler.createScheduleGroup({
            Name: server_id,
        });
    }

    const thread = yield * discord.startThreadInForumOrMediaChannel(server.forum!, {
        name   : `🏛️│Clan Capital`,
        // @ts-expect-error dfx types need to be fixed
        message: {
            content: MD.content(
                MD.h1(`Raid Weekend`),
            ),
        },
        auto_archive_duration: 1440,
    }).json;

    const now = new Date(Date.now());

    const updated = {
        ...server,
        updated: now,
        raids  : thread.id,
    };

    yield * putDiscordServer(updated);

    yield * ServerCache.set(server.pk, updated);

    yield * SetInviteOnly.send({
        group: yield * encodeServerId(server.pk),
        name : 'SetInviteOnly',
        start: now,
        after: '0 hour',
        data : {
            server: updated,
        },
    });

    const doneTime = Cron.next(raidWeekendDone);

    yield * SetOpen.send({
        group: yield * encodeServerId(server.pk),
        name : 'SetOpen',
        start: doneTime,
        after: '0 hour',
        data : {
            server: updated,
        },
    });
});
