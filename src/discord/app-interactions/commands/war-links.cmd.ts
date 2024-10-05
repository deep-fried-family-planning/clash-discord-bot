import {ApplicationCommandType} from '@discordjs/core/http-only';
import {
    OPTION_CLAN,
    OPTION_FROM,
    OPTION_TO,
} from '#src/discord/command-pipeline/commands-options.ts';
import type {CommandSpec} from '#src/discord/types.ts';

export const WAR_LINKS = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'war-links',
    description: 'get player profile links to rapidly scout enemy war camps',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_FROM,
        ...OPTION_TO,
    },
} as const satisfies CommandSpec;
