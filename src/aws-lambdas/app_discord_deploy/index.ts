import {COMMANDS} from '#src/discord/commands.ts';
import {discord} from '#src/https/api-discord.ts';
import {specToREST} from '#src/discord/command-pipeline/commands-rest.ts';
import {makeLambda} from '@effect-aws/lambda';
import {E, Logger, pipe} from '#src/utils/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {SSM_GET} from '#src/effect-aws/ssm.ts';

const h = () => E.gen(function* () {
    const ssm = yield * SSM_GET;

    const cmds = yield * pipe(COMMANDS, mapEntries((v, k) => [k, specToREST(v)]), toEntries, E.succeed);

    const allNames = pipe(cmds, map(([, cmd]) => cmd.name));

    const current = yield * E.promise(() => discord.applicationCommands.getGlobalCommands(ssm.DISCORD_APP_ID));

    for (const cmd of current) {
        if (!allNames.includes(cmd.name)) {
            yield * E.promise(() => discord.applicationCommands.deleteGlobalCommand(ssm.DISCORD_APP_ID, cmd.id));
        }
    }

    for (const [, cmd] of cmds) {
        yield * E.promise(() => discord.applicationCommands.createGlobalCommand(ssm.DISCORD_APP_ID, cmd));
    }
});

export const handler = makeLambda(h, Logger.replace(Logger.defaultLogger, Logger.structuredLogger));
