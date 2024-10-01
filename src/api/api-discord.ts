import {API} from '@discordjs/core';
import {REST} from '@discordjs/rest';
import {SECRET_DISCORD_BOT_TOKEN} from '#src/constants/secret-values.ts';

export const discord = new API(new REST({version: '10', makeRequest: global.fetch}).setToken(SECRET_DISCORD_BOT_TOKEN));
