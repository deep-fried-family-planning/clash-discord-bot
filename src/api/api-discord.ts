import {API} from '@discordjs/core';
import {REST} from '@discordjs/rest';
import {SECRET_DISCORD_BOT_TOKEN} from '#src/constants/secrets/secret-discord-bot-token.ts';

export const discord = /* @__PURE__ */ new API(new REST({version: '10', makeRequest: global.fetch}).setToken(SECRET_DISCORD_BOT_TOKEN));
