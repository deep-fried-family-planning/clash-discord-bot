import {ApplicationCommandType} from '@discordjs/core';
import type {CommandSpec} from '#src/discord/types.ts';
import {CONFIG_SERVER} from '#src/discord/app-interactions/commands/config/server/config-server.cmd.ts';

export const CONFIG = {
    name       : 'config',
    type       : ApplicationCommandType.ChatInput,
    description: 'configure DeepFryer',
    options    : {
        CONFIG_SERVER,
    },
} as const satisfies CommandSpec;
