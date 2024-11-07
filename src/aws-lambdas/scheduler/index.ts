import {E, pipe} from '#src/utils/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {mapL} from '#src/pure/pure-list.ts';
import {updateWarCountdown} from '#src/discord/actions/update-war-countdowns.ts';
import {Cause, Console, Layer} from 'effect';
import {createWarThread} from '#src/discord/actions/create-war-thread.ts';
import {LambdaLayer} from '#src/aws-lambdas/slash';
import {ClanCache, ClanCacheLive} from '#src/internals/layers/clan-cache.ts';
import {ServerCache, ServerCacheLive} from '#src/internals/layers/server-cache.ts';
import {
    DiscordClanEquivalence,
    putDiscordClan,
} from '#src/database/discord-clan.ts';
import {PlayerCache, PlayerCacheLive} from '#src/internals/layers/player-cache.ts';
import {ClashService} from '#src/internals/layers/clash-service.ts';
import {logDiscordError} from '#src/https/calls/log-discord-error.ts';

const LambdaLive = pipe(
    ClanCacheLive,
    Layer.provideMerge(ServerCacheLive),
    Layer.provideMerge(PlayerCacheLive),
    Layer.provideMerge(LambdaLayer),
);

// todo this lambda is annoying asl, fullstack test
const h = () => E.gen(function* () {
    yield * invokeCount(E.succeed(''));
    yield * showMetric(invokeCount);

    const serverCache = yield * yield * ServerCache;
    const clanCache = yield * (yield * ClanCache);
    const players = yield * PlayerCache;

    yield * Console.log(players);

    const clash = yield * ClashService;

    return yield * pipe(yield * clanCache.values,
        mapL((clan) => pipe(
            E.gen(function * () {
                const server = yield * serverCache.get(clan.pk);

                const [, clanTag] = clan.sk.split('clan-');

                const recentClan = yield * clanCache.get({pk: clan.pk, sk: clan.sk});

                const apiClan = yield * clash.getClan(clanTag);
                const apiWars = yield * clash.getWars(clanTag);

                yield * E.timeout(updateWarCountdown(recentClan, apiClan, apiWars.find((a) => a.isBattleDay)!), '10 seconds');

                if (apiWars.length === 1) {
                    const newClan = yield * E.timeout(createWarThread(server, recentClan, players, apiClan, apiWars[0]), '10 seconds');

                    if (!DiscordClanEquivalence(newClan, clan)) {
                        yield * clanCache.set({pk: newClan.pk, sk: newClan.sk}, newClan);
                        yield * putDiscordClan({
                            ...newClan,
                            updated: new Date(Date.now()),
                        });
                    }
                }
                else if (apiWars.length > 1) {
                    const newClan = yield * E.timeout(createWarThread(server, recentClan, players, apiClan, apiWars[0]), '10 seconds');
                    const newNewClan = yield * E.timeout(createWarThread(server, newClan, players, apiClan, apiWars[1]), '10 seconds');

                    if (!DiscordClanEquivalence(newNewClan, clan)) {
                        yield * clanCache.set({pk: newNewClan.pk, sk: newNewClan.sk}, newNewClan);
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

                return yield * logDiscordError([error]);
            })),
        )),
        E.allWith({concurrency: 5}),
    );
});

// todo
// close war threads during CWL
export const handler = makeLambda(h, LambdaLive);
