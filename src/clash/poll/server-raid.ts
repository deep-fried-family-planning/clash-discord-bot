// import {SetInviteOnly} from '#src/clash/task/raid-thread/set-invite-only.ts';
import type {Server} from '#src/data/index.ts';
// import {SetOpen} from '#src/clash/task/raid-thread/set-open.ts';
// import {saveItem} from '#src/database/DeepFryerDB.ts';
import {Cron, E, g, pipe} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx/DiscordREST';

const raidWeekendDone = Cron.make({
  days    : [],
  hours   : [],
  minutes : [],
  months  : [],
  weekdays: [1, 2, 3],
});

export const serverRaid = (server: Server) => g(function* () {
  const discord = yield* DiscordREST;

  if (server.raids) {
    return;
  }

  const group = yield* pipe(
    Scheduler.getScheduleGroup({Name: server.pk}),
    E.catchTag('ResourceNotFoundException', () => E.succeed({Name: undefined})),
  );

  if (!group.Name) {
    yield* Scheduler.createScheduleGroup({
      Name: server.pk,
    });
  }

  const thread = yield* discord.createThread(server.forum!, {
    name   : `🏛️│Clan Capital`,
    message: {
      content: MD.content(
        MD.h1(`Raid Weekend`),
      ),
    },
    auto_archive_duration: 1440,
  });

  const now = new Date(Date.now());

  const updated = {
    ...server,
    raids: thread.id,
  };

  // yield* saveItem(Server, updated);

  // yield* SetInviteOnly.send({
  //   group: server.pk,
  //   name : 'SetInviteOnly',
  //   start: now,
  //   after: '0 hour',
  //   data : {
  //     server: updated,
  //   },
  // });

  const doneTime = Cron.next(raidWeekendDone);

  // yield* SetOpen.send({
  //   group: server.pk,
  //   name : 'SetOpen',
  //   start: doneTime,
  //   after: '0 hour',
  //   data : {
  //     server: updated,
  //   },
  // });
});
