import {ApplicationCommandType} from 'discord-api-types/v10';
import type {CommandSpec} from '#src/discord/types.ts';

export const SMOKE = {
    name       : 'smoke',
    type       : ApplicationCommandType.ChatInput,
    description: '[admin only] smoke test',
    options    : {

    },
} as const satisfies CommandSpec;
