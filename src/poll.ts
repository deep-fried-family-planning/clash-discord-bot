import {CFG, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {Cause, Console, Layer} from 'effect';
import {ClanCache} from '#src/dynamo/cache/clan-cache.ts';
import {ServerCache} from '#src/dynamo/cache/server-cache.ts';
import {PlayerCache} from '#src/dynamo/cache/player-cache.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordConfig, DiscordRESTMemoryLive, MemoryRateLimitStoreLive} from 'dfx';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/constants/secrets.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {SQS} from '@effect-aws/client-sqs';
import {eachClan} from '#src/poll/clan-war.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


// todo this lambda is annoying asl, fullstack test
const h = () => E.gen(function* () {
    yield * invokeCount(E.succeed(''));
    yield * showMetric(invokeCount);

    const players = yield * PlayerCache.all();

    yield * Console.log(players);

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

                yield * eachClan(server, clan);
            }),
            E.catchAll((err) => logDiscordError([err])),
            E.catchAllCause((e) => E.gen(function * () {
                const error = Cause.prettyErrors(e);

                yield * logDiscordError([error]);
            })),
        )),
        E.allWith({concurrency: 5}),
    );
});


const LambdaLive = pipe(
    L.mergeAll(
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
    L.provideMerge(DiscordApi.Live),
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(MemoryRateLimitStoreLive),
    L.provideMerge(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(Layer.setConfigProvider(fromParameterStore())),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);