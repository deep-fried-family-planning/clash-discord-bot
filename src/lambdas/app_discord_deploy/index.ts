import {getSecret} from '#src/lambdas/client-aws.ts';
import {pipe} from 'fp-ts/function';
import {toArray} from 'fp-ts/Record';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import {COMMANDS} from '#src/discord/commands.ts';
import {DISCORD_APP_ID} from '#src/constants-secrets.ts';
import {discord, initDiscordClient} from '#src/api/api-discord.ts';

/**
 * @init
 */
await initDiscordClient();

const COMMAND_CONFIG = pipe(COMMANDS, toArray) satisfies [string, RESTPostAPIApplicationCommandsJSONBody][];

/**
 * @invoke
 */
export const handler = async () => {
    const discord_app_id = await getSecret(DISCORD_APP_ID);

    for (const [, cmd] of COMMAND_CONFIG) {
        await discord.applicationCommands.createGlobalCommand(discord_app_id, cmd);
    }
};
