import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import {ClanCache} from '#src/dynamo/cache/clan-cache.ts';
import {PlayerCache} from '#src/dynamo/cache/player-cache.ts';
import {ServerCache} from '#src/dynamo/cache/server-cache.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {Cron, DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {eachClan} from '#src/poll/clan-war.ts';
import {serverRaid} from '#src/poll/server-raid.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cause} from 'effect';
import {toEntries} from 'effect/Record';
import {wsBypass} from '../dev/ws-bypass.ts';



const raidWeekend = Cron.make({
  days    : [],
  hours   : [],
  minutes : [],
  months  : [],
  weekdays: [5, 6, 7, 0],
});


// todo this lambda is annoying asl, fullstack test
export const h = () => E.gen(function* () {
  yield * invokeCount(E.succeed(''));
  yield * showMetric(invokeCount);

  if (yield * wsBypass('poll', {}, E.void)) {
    return;
  }

  const now           = yield * DT.now;
  const isRaidWeekend = Cron.match(raidWeekend, now);

  if (isRaidWeekend) {
    yield * pipe(
      yield * ServerCache.values,
      mapL((server) => pipe(
        serverRaid(server),
        E.catchAll((err) => logDiscordError([err])),
        E.catchAllCause((e) => E.gen(function* () {
          const error = Cause.prettyErrors(e);

          yield * logDiscordError([error]);
        })),
      )),
      E.allWith({concurrency: 5}),
    );
  }

  const players = yield * PlayerCache.all();

  yield * pipe(yield * ClanCache.keys,
    reduceL(new Set<`${string}/${string}`>(), (set, k) => {
      set.add(k);
      return set;
    }),
    (set) => [...set],
    mapL((k) => pipe(
      E.gen(function* () {
        const [pk] = k.split('/');

        const server = yield * ServerCache.get(pk);
        const clan   = yield * ClanCache.get(k);

        yield * eachClan(server, clan, pipe(players, toEntries, mapL(([, p]) => p)));
      }),
      E.catchAll((err) => logDiscordError([err])),
      E.catchAllCause((e) => E.gen(function* () {
        const error = Cause.prettyErrors(e);

        yield * logDiscordError([error]);
      })),
    )),
    E.allWith({concurrency: 5}),
  );
});


export const LambdaLive = pipe(
  L.mergeAll(
    ServerCache.Live,
    PlayerCache.Live,
    ClanCache.Live,
  ),
  L.provideMerge(ClashKing.Live),
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(Scheduler.defaultLayer),
  L.provideMerge(SQS.defaultLayer),
  L.provideMerge(ApiGatewayManagementApi.layer({
    endpoint: process.env.APIGW_DEV_WS,
  })),
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
