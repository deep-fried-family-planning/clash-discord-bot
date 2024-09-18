import {URLSearchParams} from 'node:url';
import {callDiscord} from '#src/discord/api/api-discord.ts';

export const authDiscord = async (clientId: string, clientSecret: string, scope: string) => {
    const resp = await callDiscord<{access_token: string}>({
        method : 'POST',
        path   : '/oauth2/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type   : 'client_credentials',
            scope        : scope,
            client_id    : clientId,
            client_secret: clientSecret,
        }),
    });

    return resp.contents;
};
