import {Cfg, E, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {mapL, reduceL} from '#src/pure/pure-list.ts';
import {Cause, Console, Layer} from 'effect';
import {ClanCache} from '#src/internals/layers/clan-cache.ts';
import {ServerCache} from '#src/internals/layers/server-cache.ts';
import {PlayerCache} from '#src/internals/layers/player-cache.ts';
import {Clashofclans} from '#src/internals/layer-api/clashofclans.ts';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordConfig, DiscordRESTLive, MemoryRateLimitStoreLive} from 'dfx';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {SQSService} from '@effect-aws/client-sqs';
import {eachClan} from '#src/aws-lambdas/scheduler/checks/clan-war.ts';
import {SchedulerService} from '@effect-aws/client-scheduler';

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
        Clashofclans.Live,
        ServerCache.Live,
        PlayerCache.Live,
        ClanCache.Live,
    ),
    L.provideMerge(L.mergeAll(
        DynamoDBDocumentService.defaultLayer,
        SchedulerService.defaultLayer,
        SQSService.defaultLayer,
    )),
    L.provideMerge(DiscordRESTLive),
    L.provide(MemoryRateLimitStoreLive),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(Layer.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
