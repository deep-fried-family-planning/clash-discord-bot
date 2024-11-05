import {Cfg, E} from '#src/utils/effect.ts';
import {DiscordREST} from 'dfx';
import {Console, Redacted} from 'effect';
import {REDACTED_DISCORD_ERROR_URL} from '#src/constants/secrets.ts';

export const logDiscordError = (e: unknown) => E.gen(function * () {
    const error = e as Error;
    const discord = yield * DiscordREST;

    yield * Console.error(e);

    const [token, id] = Redacted
        .value(yield * Cfg.redacted(REDACTED_DISCORD_ERROR_URL))
        .split('/')
        .reverse();

    yield * discord.executeWebhook(id, token, {
        embeds: [{
            title      : error.name,
            description: `${error.message}\n\n${error.stack}\n\n${error}`,
        }],
    });
});
