import {pipe} from 'fp-ts/function';
import {toArray} from 'fp-ts/Record';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import {COMMANDS} from '#src/discord/commands.ts';
import {discord} from '#src/api/api-discord.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {specToREST} from '#src/discord/command-pipeline/commands-rest.ts';
import {SECRET_DISCORD_APP_ID} from '#src/constants/secrets/secret-discord-app-id.ts';

/**
 * @init
 */
const COMMAND_CONFIG = pipe(COMMANDS, toArray, mapL(([k, v]) => [k, specToREST(v)])) satisfies [string, RESTPostAPIApplicationCommandsJSONBody][];

/**
 * @invoke
 */
export const handler = async () => {
    const allNames = COMMAND_CONFIG.map(([,c]) => c.name);
    const current = await discord.applicationCommands.getGlobalCommands(SECRET_DISCORD_APP_ID);

    for (const cmd of current) {
        if (!allNames.includes(cmd.name)) {
            await discord.applicationCommands.deleteGlobalCommand(SECRET_DISCORD_APP_ID, cmd.id);
        }
    }

    for (const [, cmd] of COMMAND_CONFIG) {
        await discord.applicationCommands.createGlobalCommand(SECRET_DISCORD_APP_ID, cmd);
    }
};
