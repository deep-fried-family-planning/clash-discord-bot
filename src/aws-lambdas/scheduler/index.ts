import type {AppDiscordEvent} from '#src/aws-lambdas/app_discord/index-app-discord.types.ts';
import {E, Logger, pipe} from '#src/utils/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {makeLambda} from '@effect-aws/lambda';
import {serverCache} from '#src/database/codec/server-cache.ts';
import {fromEntries, toEntries} from 'effect/Record';
import {mapL} from '#src/pure/pure-list.ts';
import {api_coc} from '#src/https/api-coc.ts';
import {updateWarCountdown} from '#src/discord/actions/update-war-countdowns.ts';
import {Cause, Console} from 'effect';
import {show} from '#src/utils/show.ts';
import {discordLogError} from '#src/https/calls/discord-log-error.ts';
import {oopTimeout} from '#src/aws-lambdas/scheduler/oop-timeout.ts';
import {createWarThread} from '#src/discord/actions/create-war-thread.ts';
import {SERVER_RECORD, SERVER_RECORD_EQ} from '#src/database/schema/server-record.ts';
import {putServer} from '#src/database/server/put-server.ts';

const h = (event: AppDiscordEvent) => pipe(E.gen(function* () {
    yield * invokeCount(E.succeed(''));
    yield * showMetric(invokeCount);

    show(event);

    const server = yield * serverCache.get('RECORD');

    yield * pipe(
        server.clans,
        toEntries,
        mapL(([cid, cmeta]) => pipe(
            E.gen(function* () {
                const clan = yield * oopTimeout('30 seconds', () => api_coc.getClan(cid));
                const war = yield * oopTimeout('30 seconds', () => api_coc.getCurrentWar(cid));

                yield * Console.log(`checking ${cid}`);

                yield * updateWarCountdown(clan, war!, server);

                return yield * createWarThread(server, clan, war!);
            }),
            E.catchAll((error) => E.gen(function * () {
                yield * Console.log(error);
                yield * Console.log(Cause.originalError(error));

                if (error._tag !== 'TimeoutException') {
                    yield * E.promise(() => discordLogError(Cause.originalError(error)));
                }

                return [cid, cmeta] as const;
            })),
            E.catchAllDefect((defect) => E.gen(function* () {
                yield * Console.log(defect);
                yield * Console.log(Cause.originalError(defect));
                yield * E.promise(() => discordLogError(Cause.originalError(defect)));

                return [cid, cmeta] as const;
            })),
        )),
        E.allWith({concurrency: 5}),
        E.flatMap((cmetas) => E.gen(function * () {
            const current = SERVER_RECORD.make(server);
            const next = SERVER_RECORD.make({
                ...server,
                clans: fromEntries(cmetas),
            });

            yield * Console.log('staging db update');

            if (!SERVER_RECORD_EQ(current, next)) {
                yield * Console.log('updating db');
                yield * E.promise(() => putServer(next));
            }
        })),
        E.catchAll((error) => E.gen(function * () {
            yield * Console.log(error);
            yield * Console.log(Cause.originalError(error));

            // @ts-expect-error TODO fix this after refactoring concurrency/db structure
            if ('_tag' in error && error._tag !== 'TimeoutException') {
                yield * E.promise(() => discordLogError(Cause.originalError(error)));
            }
        })),
        E.catchAllDefect((defect) => E.gen(function* () {
            yield * Console.log(defect);
            yield * Console.log(Cause.originalError(defect));
            yield * E.promise(() => discordLogError(Cause.originalError(defect)));
        })),
    );
}));

export const handler = makeLambda(h, Logger.replace(Logger.defaultLogger, Logger.structuredLogger));
