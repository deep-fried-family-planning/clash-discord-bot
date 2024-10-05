import {ApplicationCommandType} from '@discordjs/core/http-only';
import {
    OPTION_CLAN, OPTION_EXHAUSTIVE,
    OPTION_FROM, OPTION_LATEST_PLAYER_INFO,
    OPTION_LIMIT,
    OPTION_NSHOW,
    OPTION_TO,
} from '#src/discord/command-pipeline/commands-options.ts';
import type {CommandSpec} from '#src/discord/types.ts';

export const CWL_SCOUT = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'cwl-scout',
    description: 'learn about enemy clans during CWL',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_FROM,
        ...OPTION_TO,
        ...OPTION_NSHOW,
        ...OPTION_LIMIT,
        ...OPTION_LATEST_PLAYER_INFO,
        ...OPTION_EXHAUSTIVE,
    },
} as const satisfies CommandSpec;
