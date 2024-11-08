import {C, CFG, E, L, RDT} from '#src/internals/re-exports/effect.ts';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {API} from '@discordjs/core/http-only';
import {REST} from '@discordjs/rest';

export class DiscordOldService extends C.Tag('DeepFryerDiscordOldService')<
    DiscordOldService,
    API
>() {}

export const DiscordOldServiceLive = L.effect(DiscordOldService, E.gen(function* () {
    const token = RDT.value(yield * CFG.redacted(REDACTED_DISCORD_BOT_TOKEN));

    return new API(new REST({version: '10'}).setToken(token));
}));
