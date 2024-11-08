import {API} from '@discordjs/core/http-only';
import {REST} from '@discordjs/rest';
import {SECRET} from '#src/internals/secrets.ts';

export const discord = /* @__PURE__ */ new API(new REST({version: '10'}).setToken(SECRET.DISCORD_BOT_TOKEN));
