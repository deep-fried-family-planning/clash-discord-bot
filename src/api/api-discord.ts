import {API} from '@discordjs/core';
import {REST} from '@discordjs/rest';
import {getSecret} from '#src/lambdas/client-aws.ts';
import {DISCORD_BOT_TOKEN} from '#src/constants-secrets.ts';

let initialized = false,
    discord: API;

export const initDiscordClient = async () => {
    if (!initialized) {
        initialized = true;

        const discord_bot_token = await getSecret(DISCORD_BOT_TOKEN);

        discord = new API(new REST({version: '10', makeRequest: global.fetch}).setToken(discord_bot_token));
    }
};

export {discord};
