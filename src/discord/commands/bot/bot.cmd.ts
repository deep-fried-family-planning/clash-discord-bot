import {ApplicationCommandType} from 'discord-api-types/v10';
import type {CommandSpec} from '#src/discord/types.ts';
import {BOT_ABOUT} from '#src/discord/commands/bot/about.cmd.ts';
import {BOT_GETTING_STARTED} from '#src/discord/commands/bot/getting-started.cmd.ts';

export const BOT = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'bot',
    description: '[todo]',
    options    : {
        BOT_ABOUT,
        BOT_GETTING_STARTED,
    },
} as const satisfies CommandSpec;
