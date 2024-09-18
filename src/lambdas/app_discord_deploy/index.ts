import {getSecret} from '#src/lambdas/client-aws.ts';
import {callDiscord} from '#src/discord/api/api-discord.ts';
import {pipe} from 'fp-ts/function';
import {toArray} from 'fp-ts/Record';
import {reduce} from 'fp-ts/Array';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import {COMMANDS} from '#src/discord/commands.ts';
import {authDiscord} from '#src/discord/api/auth-discord.ts';
import {DISCORD_APP_ID, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_PUBLIC_KEY} from '#src/constants-secrets.ts';

/**
 * @init
 */
const discord_public_key = await getSecret(DISCORD_PUBLIC_KEY);
const discord_app_id = await getSecret(DISCORD_APP_ID);
const discord_client_id = await getSecret(DISCORD_CLIENT_ID);
const discord_client_secret = await getSecret(DISCORD_CLIENT_SECRET);

const COMMAND_CONFIG = pipe(
    COMMANDS,
    toArray,
    reduce([] as RESTPostAPIApplicationCommandsJSONBody[], (acc, [, cmd]) => [...acc, cmd]),
) satisfies RESTPostAPIApplicationCommandsJSONBody[];

/**
 * @invoke
 */
export const handler = async () => {
    const bearer = await authDiscord(
        discord_client_id,
        discord_client_secret,
        'applications.commands.update',
    );

    for (const cmd of COMMAND_CONFIG) {
        await callDiscord({
            method  : 'POST',
            path    : `/applications/${discord_app_id}/commands`,
            bearer  : bearer.access_token,
            jsonBody: cmd,
        });
    }
};
