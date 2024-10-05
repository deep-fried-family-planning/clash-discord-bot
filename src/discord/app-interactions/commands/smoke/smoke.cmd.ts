import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/discord/types.ts';

export const SMOKE = {
    name       : 'smoke',
    type       : ApplicationCommandType.ChatInput,
    description: '[admin only] smoke test',
    options    : {

    },
} as const satisfies CommandSpec;
