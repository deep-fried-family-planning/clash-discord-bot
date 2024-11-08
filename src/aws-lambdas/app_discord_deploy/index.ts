import {discord} from '#src/https/api-discord.ts';
import {specToREST} from '#src/aws-lambdas/api_discord/commands-rest.ts';
import {makeLambda} from '@effect-aws/lambda';
import {E, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {SECRET} from '#src/internals/secrets.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {ONE_OF_US} from '#src/aws-lambdas/slash/commands/oneofus.ts';
import {TIME} from '#src/aws-lambdas/slash/commands/time.ts';
import {SERVER} from '#src/aws-lambdas/slash/commands/server.ts';
import {CLAN_FAM} from '#src/aws-lambdas/slash/commands/clanfam.ts';
import {USER} from '#src/aws-lambdas/slash/commands/user.ts';
import type {CommandSpec} from '#src/discord/types.ts';

export const COMMANDS = {
    ONE_OF_US,
    TIME,
    SERVER,
    CLAN_FAM,
    USER,
} as const satisfies {[k in string]: CommandSpec};

const h = () => E.gen(function* () {
    yield * invokeCount(showMetric(invokeCount));
    const cmds = yield * pipe(COMMANDS, mapEntries((v, k) => [k, specToREST(v)]), toEntries, E.succeed);

    const allNames = pipe(cmds, map(([, cmd]) => cmd.name));

    const current = yield * E.promise(() => discord.applicationCommands.getGlobalCommands(SECRET.DISCORD_APP_ID));

    for (const cmd of current) {
        if (!allNames.includes(cmd.name)) {
            yield * E.promise(() => discord.applicationCommands.deleteGlobalCommand(SECRET.DISCORD_APP_ID, cmd.id));
        }
    }

    for (const [, cmd] of cmds) {
        yield * E.promise(() => discord.applicationCommands.createGlobalCommand(SECRET.DISCORD_APP_ID, cmd));
    }
});

export const handler = makeLambda(h, Logger.replace(Logger.defaultLogger, Logger.structuredLogger));
