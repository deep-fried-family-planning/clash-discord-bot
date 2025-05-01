import {eachClan} from '#src/clash/poll/clan-war.ts';
import {serverRaid} from '#src/clash/poll/server-raid.ts';
import {scanServerClans, scanServers, scanUserPlayers} from '#src/database/DeepFryerDB.ts';
import {DeepFryerPage} from '#src/database/service/DeepFryerPage.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {Cron, DT, E, L, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {BasicLayer, ClashLayer, DatabaseLayer, DiscordLayer, NetworkLayer} from '#src/layers.ts';
import {EventRouter, EventRouterLive} from '#src/lambdas/service/EventRouter.ts';
import {TaskSchedulerLive} from '#src/lambdas/service/TaskScheduler.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {Cause} from 'effect';

const raidWeekend = Cron.make({
  days    : [],
  hours   : [],
  minutes : [],
  months  : [],
  weekdays: [5, 6, 7, 0],
});

const pollHandler = E.fn(
  function* () {
    yield* invokeCount(E.succeed(''));
    yield* showMetric(invokeCount);

    const isActive = yield* EventRouter.isActive('poll', {});

    if (!isActive) {
      return;
    }

    const now = yield* DT.now;
    const isRaidWeekend = Cron.match(raidWeekend, now);

    const servers = yield* scanServers();

    if (isRaidWeekend) {
      yield* pipe(
        servers,
        mapL((server) => pipe(
          serverRaid(server),
          E.catchAll((err) => logDiscordError([err])),
          E.catchAllCause((e) => E.gen(function* () {
            const error = Cause.prettyErrors(e);

            yield* logDiscordError([error]);
          })),
        )),
        E.allWith({concurrency: 5}),
      );
    }

    const players = yield* scanUserPlayers();
    const clans = yield* scanServerClans();

    yield* pipe(
      clans,
      mapL((clan) => pipe(
        E.gen(function* () {
          const server = servers.find((s) => s.pk === clan.pk)!;

          yield* eachClan(server, clan, players);
        }),
        E.catchAll((err) => logDiscordError([err])),
        E.catchAllCause((e) => E.gen(function* () {
          const error = Cause.prettyErrors(e);

          yield* logDiscordError([error]);
        })),
      )),
      E.allWith({concurrency: 5}),
    );
  },
  E.awaitAllChildren,
  E.catchAllDefect((d) => {
    console.log(d);
    return E.die(d);
  }),
);

const layer = pipe(
  L.mergeAll(
    ClashLayer,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    EventRouterLive,
    TaskSchedulerLive,
    DeepFryerPage.Default,
  ),
  L.provideMerge(DiscordLayer),
  L.provideMerge(DatabaseLayer),
  L.provideMerge(NetworkLayer),
  L.provideMerge(BasicLayer),
);

export const handler = LambdaHandler.make({
  handler: pollHandler,
  layer  : layer,
});
