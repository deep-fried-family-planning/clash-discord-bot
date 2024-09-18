import {bindApiCall} from '#src/api/api-call.ts';
import {getSecret} from '#src/lambdas/client-aws.ts';
import {DISCORD_APP_ID, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_PUBLIC_KEY} from '#src/constants-secrets.ts';

export const callDiscord = bindApiCall('https://discord.com/api/v10');

export const initDiscord = async () => {
    const discord_public_key = await getSecret(DISCORD_PUBLIC_KEY);
    const discord_app_id = await getSecret(DISCORD_APP_ID);
    const discord_client_id = await getSecret(DISCORD_CLIENT_ID);
    const discord_client_secret = await getSecret(DISCORD_CLIENT_SECRET);

    return {
        public_key   : discord_public_key,
        app_id       : discord_app_id,
        client_id    : discord_client_id,
        client_secret: discord_client_secret,
    };
};
