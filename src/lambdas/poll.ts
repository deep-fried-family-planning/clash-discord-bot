import {eachClan} from '#src/clash/poll/clan-war.ts';
import {serverRaid} from '#src/clash/poll/server-raid.ts';
import {Cron, DT, E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouter} from '#src/service/EventRouter.ts';

const raidWeekend = Cron.make({
  days    : [],
  hours   : [],
  minutes : [],
  months  : [],
  weekdays: [5, 6, 7, 0],
});

export const poll = () => E.gen(function* () {
  // const isActive = yield* EventRouter.isActive('poll', {});
  //
  // if (!isActive) {
  //   return;
  // }
  //
  // const now = yield* DT.now;
  // const isRaidWeekend = Cron.match(raidWeekend, now);
  //
  // const servers = yield* scanServers();
  //
  // if (isRaidWeekend) {
  //   yield* pipe(
  //     servers,
  //     mapL((server) => pipe(
  //       serverRaid(server),
  //     )),
  //     E.allWith({concurrency: 5}),
  //   );
  // }
  //
  // const players = yield* scanUserPlayers();
  // const clans = yield* scanServerClans();
  //
  // yield* pipe(
  //   clans,
  //   mapL((clan) => pipe(
  //     E.gen(function* () {
  //       const server = servers.find((s) => s.pk === clan.pk)!;
  //
  //       yield* eachClan(server, clan, players);
  //     }),
  //   )),
  //   E.allWith({concurrency: 5}),
  // );
}).pipe(
  E.tapError((error) => DeepFryerLogger.logError(error)),
  E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
);
