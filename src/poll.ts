import {Ar, Cron, DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {Cause} from 'effect';
import {ClanCache} from '#src/dynamo/cache/clan-cache.ts';
import {ServerCache} from '#src/dynamo/cache/server-cache.ts';
import {PlayerCache} from '#src/dynamo/cache/player-cache.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {SQS} from '@effect-aws/client-sqs';
import {eachClan} from '#src/poll/clan-war.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {toEntries} from 'effect/Record';
import {ClashKing} from '#src/clash/clashking.ts';
import {serverRaid} from '#src/poll/server-raid.ts';


const raidWeekend = Cron.make({
    days    : [],
    hours   : [],
    minutes : [],
    months  : [],
    weekdays: [5, 6, 7, 0],
    tz      : DT.zoneMakeLocal(),
});


// todo this lambda is annoying asl, fullstack test
export const h = () => E.gen(function * () {
    yield * invokeCount(E.succeed(''));
    yield * showMetric(invokeCount);

    const players = yield * PlayerCache.all();
    const servers = yield * ServerCache.values;

    const now = yield * DT.now;
    const isRaidWeekend = Cron.match(raidWeekend, now);


    if (isRaidWeekend) {
        yield * pipe(
            servers,
            Ar.map((server) => serverRaid(server)),
            E.allWith({concurrency: 'unbounded'}),
        );
    }

    yield * pipe(yield * ClanCache.keys,
        reduceL(new Set<`${string}/${string}`>(), (set, k) => {
            set.add(k);
            return set;
        }),
        (set) => [...set],
        mapL((k) => pipe(
            E.gen(function * () {
                const [pk] = k.split('/');

                const server = yield * ServerCache.get(pk);
                const clan = yield * ClanCache.get(k);

                yield * eachClan(server, clan, pipe(players, toEntries, mapL(([, p]) => p)));
            }),
            E.catchAll((err) => logDiscordError([err])),
            E.catchAllCause((e) => E.gen(function * () {
                const error = Cause.prettyErrors(e);

                yield * logDiscordError([error]);
            })),
        )),
        E.allWith({concurrency: 'unbounded'}),
    );
});


export const LambdaLive = pipe(
    L.mergeAll(
        ClashKing.Live,
        ClashOfClans.Live,
        ServerCache.Live,
        PlayerCache.Live,
        ClanCache.Live,
    ),
    L.provideMerge(L.mergeAll(
        DynamoDBDocument.defaultLayer,
        Scheduler.defaultLayer,
        SQS.defaultLayer,
    )),
    L.provideMerge(DiscordLayerLive),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
