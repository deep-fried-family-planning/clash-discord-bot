import {ApplicationCommandType} from '@discordjs/core';
import {
    OPTION_CLAN, OPTION_EXHAUSTIVE,
    OPTION_FROM,
    OPTION_LIMIT,
    OPTION_TO,
} from '#src/discord/command-pipeline/commands-options.ts';

export const WAR_OPPONENT = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'war-opponent',
    description: 'mirror-to-mirror comparison of our clan vs enemy clan with hit/defense rates',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_FROM,
        ...OPTION_TO,
        ...OPTION_LIMIT,
        ...OPTION_EXHAUSTIVE,
    },
} as const;
