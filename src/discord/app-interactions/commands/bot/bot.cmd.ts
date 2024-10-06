import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/discord/types.ts';
import {BOT_ABOUT} from '#src/discord/app-interactions/commands/bot/bot-about.cmd.ts';

export const BOT = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'bot',
    description: '[todo]',
    options    : {
        BOT_ABOUT,
    },
} as const satisfies CommandSpec;
