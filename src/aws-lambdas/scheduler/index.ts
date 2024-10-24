import type {AppDiscordEvent} from '#src/aws-lambdas/app_discord/index-app-discord.types.ts';
import {E, Logger, pipe} from '#src/utils/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {serverCache} from '#src/database/codec/server-cache.ts';
import {toEntries} from 'effect/Record';
import {mapL} from '#src/pure/pure-list.ts';
import {api_coc} from '#src/https/api-coc.ts';
import {updateWarCountdown} from '#src/discord/actions/update-war-countdowns.ts';
import {Cause, Console} from 'effect';
import {show} from '#src/utils/show.ts';
import {discordLogError} from '#src/https/calls/discord-log-error.ts';
import {oopTimeout} from '#src/aws-lambdas/scheduler/oop-timeout.ts';

const h = (event: AppDiscordEvent) => pipe(
    E.gen(function* () {
        yield * invokeCount(E.succeed(''));
        yield * showMetric(invokeCount);

        show(event);

        const server = yield * serverCache.get('1287829383544963154');

        yield * pipe(
            server.clans,
            toEntries,
            mapL(([cid, cmeta]) => pipe(
                E.gen(function* () {
                    const clan = yield * oopTimeout('30 seconds', () => api_coc.getClan(cid));
                    const war = yield * oopTimeout('30 seconds', () => api_coc.getCurrentWar(cid));

                    yield * Console.log(`checking ${cid}`);

                    return yield * updateWarCountdown(clan, war!, server);
                }),
            )),
            E.allWith({concurrency: 3}),
            E.catchAll((error) => E.gen(function * () {
                yield * Console.log(error);
                yield * Console.log(Cause.originalError(error));
                yield * E.promise(() => discordLogError(Cause.originalError(error)));
            })),
            E.catchAllDefect((defect) => E.gen(function* () {
                yield * Console.log(defect);
                yield * Console.log(Cause.originalError(defect));
                yield * E.promise(() => discordLogError(Cause.originalError(defect)));
            })),
        );
    }),
);

export const handler = makeLambda(h, Logger.replace(Logger.defaultLogger, Logger.structuredLogger));
