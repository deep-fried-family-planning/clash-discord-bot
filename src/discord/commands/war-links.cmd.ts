import {ApplicationCommandType} from 'discord-api-types/v10';
import {
    OPTION_CLAN, OPTION_EXHAUSTIVE,
    OPTION_FROM, OPTION_LATEST_PLAYER_INFO,
    OPTION_LIMIT,
    OPTION_NSHOW,
    OPTION_TO,
} from '#src/discord/command-pipeline/commands-options.ts';
import type {CommandSpec} from '#src/discord/types.ts';

export const WAR_LINKS = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'war-links',
    description: 'get player profile links for top #10 enemy bases in current war',
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
