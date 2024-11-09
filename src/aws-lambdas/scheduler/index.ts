import {Cfg, E, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {mapL, reduceL} from '#src/pure/pure-list.ts';
import {updateWarCountdown} from '#src/aws-lambdas/scheduler/checks/update-war-countdowns.ts';
import {Cause, Console, Layer} from 'effect';
import {createWarThread} from '#src/aws-lambdas/scheduler/checks/create-war-thread.ts';
import {ClanCache, ClanCacheLive} from '#src/internals/layers/clan-cache.ts';
import {ServerCache, ServerCacheLive} from '#src/internals/layers/server-cache.ts';
import {DiscordClanEquivalence, putDiscordClan} from '#src/database/discord-clan.ts';
import {PlayerCache, PlayerCacheLive} from '#src/internals/layers/player-cache.ts';
import {ClashPerkServiceLive, ClashperkService} from '#src/internals/layers/clashperk-service.ts';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordConfig, DiscordRESTLive, MemoryRateLimitStoreLive} from 'dfx';
import {DefaultDynamoDBDocumentServiceLayer} from '@effect-aws/lib-dynamodb';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {layerWithoutAgent, makeAgentLayer} from '@effect/platform-node/NodeHttpClient';
import {fromParameterStore} from '@effect-aws/ssm';

const LambdaLive = pipe(
    ClanCacheLive,
    L.provideMerge(ServerCacheLive),
    L.provideMerge(PlayerCacheLive),
    L.provideMerge(DiscordRESTLive),
    L.provideMerge(ClashPerkServiceLive),
    L.provideMerge(DefaultDynamoDBDocumentServiceLayer),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provide(MemoryRateLimitStoreLive),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(layerWithoutAgent),
    L.provide(makeAgentLayer({keepAlive: true})),
    L.provide(Layer.setConfigProvider(fromParameterStore())),
);

// todo this lambda is annoying asl, fullstack test
const h = () => E.gen(function* () {
    yield * invokeCount(E.succeed(''));
    yield * showMetric(invokeCount);

    const serverCache = yield * yield * ServerCache;
    const clanCache = yield * (yield * ClanCache);
    const players = yield * PlayerCache;

    yield * Console.log(players);

    const clash = yield * ClashperkService;

    return yield * pipe(yield * clanCache.keys,
        reduceL(new Set<`${string}/${string}`>(), (set, k) => {
            set.add(k);
            return set;
        }),
        (set) => [...set],
        mapL((k) => pipe(
            E.gen(function * () {
                const [pk, sk] = k.split('/');

                const server = yield * serverCache.get(pk);

                const [, clanTag] = sk.split('clan-');

                const clan = yield * clanCache.get(k);

                const apiClan = yield * clash.getClan(clanTag);
                const apiWars = yield * clash.getWars(clanTag);

                yield * updateWarCountdown(clan, apiClan, apiWars.find((a) => a.isBattleDay)!);

                if (apiWars.length === 1) {
                    const newClan = yield * E.timeout(createWarThread(server, clan, players, apiClan, apiWars[0]), '10 seconds');

                    if (!DiscordClanEquivalence(newClan, clan)) {
                        yield * clanCache.set(`${newClan.pk}/${newClan.sk}`, newClan);
                        yield * putDiscordClan({
                            ...newClan,
                            updated: new Date(Date.now()),
                        });
                    }
                }
                else if (apiWars.length > 1) {
                    const newClan = yield * E.timeout(createWarThread(server, clan, players, apiClan, apiWars[0]), '10 seconds');
                    const newNewClan = yield * E.timeout(createWarThread(server, newClan, players, apiClan, apiWars[1]), '10 seconds');

                    if (!DiscordClanEquivalence(newNewClan, clan)) {
                        yield * clanCache.set(`${newNewClan.pk}/${newNewClan.sk}`, newNewClan);
                        yield * putDiscordClan({
                            ...newNewClan,
                            updated: new Date(Date.now()),
                        });
                    }
                }
            }),
            E.catchAll((err) => logDiscordError([err])),
            E.catchAllCause((e) => E.gen(function * () {
                const error = Cause.prettyErrors(e);

                yield * logDiscordError([error]);
            })),
        )),
        E.allWith({concurrency: 5}),
    );

    return yield * E.die('temp kill instance'); // todo very important lol
});

// todo
// close war threads during CWL
export const handler = makeLambda(h, LambdaLive);
