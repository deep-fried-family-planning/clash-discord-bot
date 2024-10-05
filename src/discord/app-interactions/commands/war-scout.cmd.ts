import {ApplicationCommandType} from '@discordjs/core/http-only';
import {
    OPTION_CLAN, OPTION_EXHAUSTIVE,
    OPTION_LIMIT,
} from '#src/discord/command-pipeline/commands-options.ts';

export const WAR_SCOUT = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'war-scout',
    description: 'learn enemy clan behaviors and capabilities through a range of war statistics',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_LIMIT,
        ...OPTION_EXHAUSTIVE,
    },
} as const;
