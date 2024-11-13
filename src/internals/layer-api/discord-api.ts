import {E, L} from '#src/internals/re-exports/effect.ts';
import {DiscordREST} from 'dfx/DiscordREST';
import type {EA} from '#src/internals/types.ts';

const api = E.gen(function * () {
    const discord = yield * DiscordREST;

    return discord;
});

export class DiscordApi extends E.Tag('DeepFryerDiscord')<
    DiscordApi,
    EA<typeof api>
>() {
    static Live = L.effect(this, api);
}
