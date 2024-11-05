import {Cfg, E, pipe} from '#src/utils/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {mapL} from '#src/pure/pure-list.ts';
import {api_coc} from '#src/https/api-coc.ts';
import {updateWarCountdown} from '#src/discord/actions/update-war-countdowns.ts';
import {Cause, Console, Layer, Redacted} from 'effect';
import {oopTimeout} from '#src/aws-lambdas/scheduler/oop-timeout.ts';
import {createWarThread} from '#src/discord/actions/create-war-thread.ts';
import {LambdaLayer} from '#src/aws-lambdas/slash';
import {ClanCache, ClanCacheLive} from '#src/aws-lambdas/scheduler/clan-cache.ts';
import {ServerCache, ServerCacheLive} from '#src/aws-lambdas/scheduler/server-cache.ts';
import {DiscordClan, DiscordClanEquivalence, putDiscordClan} from '#src/database/discord-clan.ts';
import {DiscordREST} from 'dfx';
import {REDACTED_DISCORD_ERROR_URL} from '#src/constants/secrets.ts';
import {PlayerCache, PlayerCacheLive} from '#src/aws-lambdas/scheduler/player-cache.ts';

const LambdaLive = pipe(
    ClanCacheLive,
    Layer.provideMerge(ServerCacheLive),
    Layer.provideMerge(PlayerCacheLive),
    Layer.provideMerge(LambdaLayer),
);

const h = () => pipe(E.gen(function* () {
    yield * invokeCount(E.succeed(''));
    yield * showMetric(invokeCount);

    const serverCache = yield * yield * ServerCache;
    const clanCache = yield * (yield * ClanCache);
    const players = yield * PlayerCache;

    yield * Console.log(players);

    yield * pipe(
        yield * clanCache.values,
        mapL((clan) => pipe(
            E.gen(function * () {
                const server = yield * serverCache.get(clan.pk);

                const [, clanTag] = clan.sk.split('clan-');

                const recentClan = yield * clanCache.get({pk: clan.pk, sk: clan.sk});

                const apiClan = yield * oopTimeout('10 seconds', () => api_coc.getClan(clanTag));
                const apiWars = yield * oopTimeout('10 seconds', () => api_coc.getWars(clanTag));

                yield * Console.log('COC');

                // const wars = pipe(apiWars, sortL<ClanWar>((a, b) => {
                //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
                //     const diff = a.preparationStartTime.getTime() - b.preparationStartTime.getTime();
                //
                //     if (diff > 0) {
                //         return 1;
                //     }
                //     else if (diff < 0) {
                //         return -1;
                //     }
                //     return 0;
                // }));

                // yield * updateWarCountdown(recentClan, apiClan, apiWars.find((a) => a.isBattleDay)!);

                yield * Console.log('countdown');

                if (apiWars.length === 1) {
                    const newClan = yield * E.timeout(createWarThread(server, recentClan, players, apiClan, apiWars[0]), '10 seconds');

                    if (!DiscordClanEquivalence(DiscordClan.make(newClan), clan)) {
                        yield * clanCache.set({pk: newClan.pk, sk: newClan.sk}, newClan);
                        yield * putDiscordClan(newClan);
                    }
                }
                else if (apiWars.length > 1) {
                    const newClan = yield * E.timeout(createWarThread(server, recentClan, players, apiClan, apiWars[0]), '10 seconds');
                    const newNewClan = yield * E.timeout(createWarThread(server, newClan, players, apiClan, apiWars[1]), '10 seconds');

                    if (!DiscordClanEquivalence(DiscordClan.make(newNewClan), clan)) {
                        yield * clanCache.set({pk: newNewClan.pk, sk: newNewClan.sk}, newNewClan);
                        yield * putDiscordClan(newNewClan);
                    }
                }
            }),
            E.catchAllCause((e) => E.gen(function * () {
                const discord = yield * DiscordREST;

                // yield * Console.error(e);

                const error = Cause.prettyErrors(e);

                yield * Console.error(...error);

                const [token, id] = Redacted
                    .value(yield * Cfg.redacted(REDACTED_DISCORD_ERROR_URL))
                    .split('/')
                    .reverse();

                yield * discord.executeWebhook(id, token, {
                    embeds: [{
                        title      : 'Error',
                        description: error.map((err) => `${err.name}\n${err.message}`).join('\n\n'),
                    }],
                });
            })),
        )),
        E.allWith({concurrency: 5}),
    );
}));

export const handler = makeLambda(h, LambdaLive);

handler();
