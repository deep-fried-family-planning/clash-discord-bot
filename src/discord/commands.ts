import {ApplicationCommandType} from 'discord-api-types/v10';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import {OPTION_CLAN, OPTION_EXHAUSTIVE, OPTION_FROM, OPTION_LATEST_PLAYER_INFO, OPTION_LIMIT, OPTION_NSHOW, OPTION_TO} from '#src/discord/commands-options.ts';

export type CommandConfig = typeof COMMANDS[keyof typeof COMMANDS];

export const COMMANDS = {
    TEST_DFFP: {
        type       : ApplicationCommandType.ChatInput,
        name       : 'test-dffp',
        description: 'WIP - try it out if curious in the meantime tho!',
        options    : [

        ],
    },

    CWL_SCOUT: {
        type       : ApplicationCommandType.ChatInput,
        name       : 'cwl-scout',
        description: 'learn about enemy clans during CWL',
        options    : [
            OPTION_CLAN,
            OPTION_FROM,
            OPTION_TO,
            OPTION_NSHOW,
            OPTION_LIMIT,
            OPTION_LATEST_PLAYER_INFO,
            OPTION_EXHAUSTIVE,
        ],
    },

    WAR_LINK: {
        type       : ApplicationCommandType.ChatInput,
        name       : 'war-links',
        description: 'get player profile links for top #10 enemy bases in current war',
        options    : [
            OPTION_CLAN,
            OPTION_FROM,
            OPTION_TO,
            OPTION_NSHOW,
            OPTION_LIMIT,
            OPTION_LATEST_PLAYER_INFO,
            OPTION_EXHAUSTIVE,
        ],
    } as const,

    WAR_SCOUT: {
        type       : ApplicationCommandType.ChatInput,
        name       : 'war-scout',
        description: 'learn enemy clan behaviors and capabilities through a range of war statistics',
        options    : [
            OPTION_CLAN,
            OPTION_FROM,
            OPTION_TO,
            OPTION_NSHOW,
            OPTION_LIMIT,
            OPTION_LATEST_PLAYER_INFO,
            OPTION_EXHAUSTIVE,
        ],
    } as const,

    WAR_OPPONENT: {
        type       : ApplicationCommandType.ChatInput,
        name       : 'war-opponent',
        description: 'mirror-to-mirror comparison of our clan vs enemy clan with hit/defense rates',
        options    : [
            OPTION_CLAN,
            OPTION_FROM,
            OPTION_TO,
            OPTION_NSHOW,
            OPTION_LIMIT,
            OPTION_LATEST_PLAYER_INFO,
            OPTION_EXHAUSTIVE,
        ],
    } as const,

} as const satisfies {[k in string]: RESTPostAPIApplicationCommandsJSONBody};
