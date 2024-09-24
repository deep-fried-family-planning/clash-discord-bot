import {getSecret} from '#src/lambdas/client-aws.ts';
import {pipe} from 'fp-ts/function';
import {toArray} from 'fp-ts/Record';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import {COMMANDS} from '#src/discord/commands.ts';
import {DISCORD_APP_ID} from '#src/constants-secrets.ts';
import {discord, initDiscordClient} from '#src/api/api-discord.ts';
import {mapL} from '#src/data/pure-list.ts';
import {specToREST} from '#src/discord/command-pipeline/commands-rest.ts';

/**
 * @init
 */
await initDiscordClient();

const COMMAND_CONFIG = pipe(COMMANDS, toArray, mapL(([k, v]) => [k, specToREST(v)])) satisfies [string, RESTPostAPIApplicationCommandsJSONBody][];

/**
 * @invoke
 */
export const handler = async () => {
    const discord_app_id = await getSecret(DISCORD_APP_ID);

    const allNames = COMMAND_CONFIG.map(([,c]) => c.name);
    const current = await discord.applicationCommands.getGlobalCommands(discord_app_id);

    for (const cmd of current) {
        if (!allNames.includes(cmd.name)) {
            await discord.applicationCommands.deleteGlobalCommand(discord_app_id, cmd.id);
        }
    }

    for (const [, cmd] of COMMAND_CONFIG) {
        await discord.applicationCommands.createGlobalCommand(discord_app_id, cmd);
    }
};
